# -*- coding: utf-8 -*-
"""
Runs on a GitHub runner: unscrambles a render package (render/<job>/), assembles the film with
assemble.py, makes a <=22.5MB 720p copy for e-mail, and writes both back XOR-scrambled.

    python3 render_job.py <job>
"""
import json
import math
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

KEY = 0xA7
xor = lambda b: bytes(x ^ KEY for x in b)
job = sys.argv[1]
R, W = Path('render') / job, Path('/tmp/work') / job
W.mkdir(parents=True, exist_ok=True)
t0 = time.time()

for f in R.rglob('*'):
    if f.is_file() and 'out' not in f.relative_to(R).parts[:1]:
        rel = f.relative_to(R)
        dst = W / (str(rel)[:-4] if f.suffix == '.bin' else str(rel))
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(xor(f.read_bytes()) if f.suffix == '.bin' else f.read_bytes())

e = json.loads((W / 'edl.json').read_text(encoding='utf-8'))
for k in ('assets', 'clips', 'audio', 'words', 'fontsdir'):
    if e.get(k):
        e[k] = str(W / e[k])
(W / 'edl_abs.json').write_text(json.dumps(e, ensure_ascii=False), encoding='utf-8')
print('unpacked in %.0fs' % (time.time() - t0), flush=True)

final = W / 'final.mp4'
subprocess.run(['python3', 'assemble.py', str(W / 'edl_abs.json'), str(final)], check=True)

dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(final)],
                           capture_output=True, text=True).stdout.strip())
vb = int(22.5 * 8 * 1024 / dur - 96)
mail = W / 'email.mp4'
base = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(final), '-vf', 'scale=1280:720:flags=lanczos',
        '-c:v', 'libx264', '-preset', 'slow', '-b:v', '%dk' % vb]
subprocess.run(base + ['-pass', '1', '-passlogfile', str(W / 'p'), '-an', '-f', 'mp4', '/dev/null'], check=True)
subprocess.run(base + ['-pass', '2', '-passlogfile', str(W / 'p'), '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', str(mail)], check=True)

out = R / 'out'
out.mkdir(exist_ok=True)
for f in (final, mail):
    (out / (f.name + '.bin')).write_bytes(xor(f.read_bytes()))
log = {'duration': dur, 'final_mb': round(final.stat().st_size / 1e6, 1), 'email_mb': round(mail.stat().st_size / 1e6, 1),
       'email_kbps': vb, 'minutes': round((time.time() - t0) / 60, 1)}
(out / 'log.json').write_text(json.dumps(log), encoding='utf-8')
print(log)
