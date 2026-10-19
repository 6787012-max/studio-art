# -*- coding: utf-8 -*-
"""
מרנדר מחדש חלק אחד שנכשל של סרט (render_parts.py), מפוצל לכמה חלקים קטנים, ומחבר הכול מחדש.
    python productions/azamra342/retry_part.py <film_id> <total_seconds> <part_index> [--split 2] [--part 70]
אותה חלוקה בדיוק כמו render_parts (n = ceil(total/part)), כך שהחלק החדש נכנס במקום הישן.
"""
import argparse
import io
import math
import os
import subprocess
import sys
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
ap = argparse.ArgumentParser(); ap.add_argument('film'); ap.add_argument('total', type=float); ap.add_argument('idx', type=int)
ap.add_argument('--split', type=int, default=2); ap.add_argument('--part', type=float, default=70)
a = ap.parse_args()
INC = ['productions/azamra342/road.js', 'productions/azamra342/shul.js', 'lib/people_pro.js', 'lib/stage3d.js', 'lib/figure3d.js', 'lib/geo_eretz.js', 'node_modules/three/build/three.module.js', 'node_modules/three/build/three.core.js']
src = io.open(os.path.join(HERE, a.film + '.html'), encoding='utf-8').read()
n = max(1, math.ceil(a.total / a.part)); L = a.total / n
P0, PD = a.idx * L, (L if a.idx < n - 1 else a.total - a.idx * L)
outdir = os.path.join(HERE, 'render', a.film); sub = os.path.join(outdir, 'part%02d_sub' % a.idx); os.makedirs(sub, exist_ok=True)
res = {}


def one(k):
    t0, d = P0 + k * PD / a.split, PD / a.split
    page = os.path.join(HERE, '_part_%s_%d_%d.html' % (a.film, a.idx, k))
    io.open(page, 'w', encoding='utf-8').write(src.replace('<script type="importmap">', '<script>window.__T0=%.4f;</script>\n<script type="importmap">' % t0, 1))
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'capture_remote.py'), 'p3r_%s_%d_%d' % (a.film, a.idx, k), os.path.relpath(page, ROOT).replace('\\', '/'),
                        os.path.relpath(os.path.join(sub, 's%d' % k), ROOT).replace('\\', '/'), '--dur', '%.4f' % d, '--include'] + INC,
                       cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace')
    res[k] = r.returncode
    print('sub %d/%d t0=%.1f d=%.1f -> rc=%d %s' % (k + 1, a.split, t0, d, r.returncode, (r.stdout or '')[-160:].replace('\n', ' ')), flush=True)


th = []
for k in range(a.split):
    t = threading.Thread(target=one, args=(k,)); t.start(); th.append(t); time.sleep(20)
for t in th:
    t.join()
outs = [os.path.join(sub, 's%d' % k, 'out.mp4') for k in range(a.split)]
if any(res.get(k) != 0 or not os.path.exists(outs[k]) for k in range(a.split)):
    print('FAILED', res); sys.exit(1)
pdir = os.path.join(outdir, 'part%02d' % a.idx); os.makedirs(pdir, exist_ok=True)
lst = os.path.join(sub, 'list.txt'); io.open(lst, 'w').write(''.join("file '%s'\n" % o.replace('\\', '/') for o in outs))
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(pdir, 'out.mp4')], check=True)
# חיבור כל הסרט מחדש
lst = os.path.join(outdir, 'parts.txt')
io.open(lst, 'w').write(''.join("file '%s'\n" % os.path.join(outdir, 'part%02d' % i, 'out.mp4').replace('\\', '/') for i in range(n)))
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(outdir, 'out.mp4')], check=True)
d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(outdir, 'out.mp4')], capture_output=True, text=True).stdout)
print('joined %s: %.1fs (expected %.1f)' % (a.film, d, a.total))
