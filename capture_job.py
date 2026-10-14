# -*- coding: utf-8 -*-
"""
Runs on a GitHub runner: unscrambles a capture package (capture/<job>/tree), installs the Hebrew fonts,
captures the HTML scene frame by frame (tools/capture.py, Chromium), and writes the mp4 back XOR-scrambled
together with a <=22.5MB 720p copy for e-mail.

    python3 capture_job.py <job>
"""
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

KEY = 0xA7
xor = lambda b: bytes(x ^ KEY for x in b)
job = sys.argv[1]
R = Path('capture') / job
W = Path('/tmp/cap') / job
cfg = json.loads((R / 'job.json').read_text(encoding='utf-8'))
t0 = time.time()
for f in (R / 'tree').rglob('*'):
    if f.is_file():
        rel = f.relative_to(R / 'tree')
        dst = W / (str(rel)[:-4] if f.suffix == '.bin' else str(rel))
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(xor(f.read_bytes()) if f.suffix == '.bin' else f.read_bytes())
fonts = Path.home() / '.fonts'
fonts.mkdir(exist_ok=True)
for f in (R / 'fonts').glob('*.ttf'):
    shutil.copy(f, fonts)
subprocess.run(['fc-cache', '-f'], check=True)
print('unpacked in %.0fs' % (time.time() - t0), flush=True)

out = W / 'out.mp4'
cmd = ['python3', str(W / 'tools/capture.py'), str(W / cfg['scene']), str(out), '--dur', str(cfg['dur']), '--fps', str(cfg.get('fps', 30)),
       '--size', cfg.get('size', '1920x1080'), '--browser', 'chromium']
if cfg.get('audio'):
    cmd += ['--audio', str(W / cfg['audio'])]
subprocess.run(cmd, check=True)

dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(out)],
                           capture_output=True, text=True).stdout.strip())
vb = int(min(4000, 22.5 * 8 * 1024 / dur - 128))
mail = W / 'email.mp4'
base = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(out), '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-b:v', '%dk' % vb]
subprocess.run(base + ['-pass', '1', '-passlogfile', str(W / 'p'), '-an', '-f', 'mp4', '/dev/null'], check=True)
subprocess.run(base + ['-pass', '2', '-passlogfile', str(W / 'p'), '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', str(mail)], check=True)
o = R / 'out'
o.mkdir(exist_ok=True)
for f in (out, mail):
    (o / (f.name + '.bin')).write_bytes(xor(f.read_bytes()))
log = {'duration': dur, 'mb': round(out.stat().st_size / 1e6, 1), 'email_mb': round(mail.stat().st_size / 1e6, 1), 'minutes': round((time.time() - t0) / 60, 1)}
(o / 'log.json').write_text(json.dumps(log), encoding='utf-8')
print(log)
