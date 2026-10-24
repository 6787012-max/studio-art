# -*- coding: utf-8 -*-
"""k11: מרנדר מחדש חלקים בודדים שנכשלו ב-render_parts (אותם t0/d), ואפשר לפצל חלק לתת-חלקים.
    python productions/k11_masach/rerun_parts.py k11 495.46 --part 70 --idx 3 --split 1
    python productions/k11_masach/rerun_parts.py k11 495.46 --part 70 --idx 6 --split 2
אחר כך מחבר את כל החלקים ל-out.mp4 כמו render_parts."""
import argparse, io, math, os, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
ap = argparse.ArgumentParser()
ap.add_argument('film'); ap.add_argument('total', type=float); ap.add_argument('--part', type=float, default=70)
ap.add_argument('--idx', type=int, required=True); ap.add_argument('--split', type=int, default=1)
ap.add_argument('--join', action='store_true')
a = ap.parse_args()
src = io.open(os.path.join(HERE, a.film + '.html'), encoding='utf-8').read()
n = max(1, math.ceil(a.total / a.part)); L = a.total / n
INC = ['productions/azamra342/road.js', 'productions/azamra342/shul.js', 'lib/people_pro.js', 'lib/stage3d.js', 'lib/figure3d.js', 'lib/geo_eretz.js', 'node_modules/three/build/three.module.js', 'node_modules/three/build/three.core.js']
outdir = os.path.join(HERE, 'render', a.film)
i = a.idx
T0, D = i * L, (L if i < n - 1 else a.total - i * L)
subs = []
for s in range(a.split):
    t0, d = T0 + s * D / a.split, D / a.split
    tag = '%d' % i if a.split == 1 else '%d_%d' % (i, s)
    page = os.path.join(HERE, '_part_%s_%s.html' % (a.film, tag))
    io.open(page, 'w', encoding='utf-8').write(src.replace('<script type="importmap">', '<script>window.__T0=%.4f;</script>\n<script type="importmap">' % t0, 1))
    od = os.path.join(outdir, 'part%02d' % i if a.split == 1 else 'part%02d_%d' % (i, s))
    for attempt in range(2):
        r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'capture_remote.py'), 'p3d_%s_%s_r%d' % (a.film, tag, attempt),
                            os.path.relpath(page, ROOT).replace('\\', '/'), os.path.relpath(od, ROOT).replace('\\', '/'), '--dur', '%.4f' % d, '--include'] + INC,
                           cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace')
        ok = r.returncode == 0 and os.path.exists(os.path.join(od, 'out.mp4'))
        print('sub %s attempt %d t0=%.2f d=%.2f rc=%d ok=%s' % (tag, attempt, t0, d, r.returncode, ok), flush=True)
        if ok:
            break
        print((r.stdout or '')[-400:] + (r.stderr or '')[-400:], flush=True)
        time.sleep(30)
    if not ok:
        sys.exit(1)
    subs.append(os.path.join(od, 'out.mp4'))
if a.split > 1:
    os.makedirs(os.path.join(outdir, 'part%02d' % i), exist_ok=True)
    lst = os.path.join(outdir, 'sub%02d.txt' % i)
    io.open(lst, 'w').write(''.join("file '%s'\n" % p.replace('\\', '/') for p in subs))
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(outdir, 'part%02d' % i, 'out.mp4')], check=True)
print('part %d done' % i)
