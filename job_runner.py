# -*- coding: utf-8 -*-
"""
Generic remote job: unscramble jobs/<job>/in (*.bin are XOR 0xA7), run the command in jobs/<job>/job.json
(paths relative to the unpacked work dir), then scramble everything under the work dir's "out" folder back
into jobs/<job>/out.

    python3 job_runner.py <job>
"""
import json
import os
import subprocess
import sys
import time
from pathlib import Path

KEY = 0xA7
xor = lambda b: bytes(x ^ KEY for x in b)
job = sys.argv[1]
R, W = Path('jobs') / job, Path('/tmp/job') / job
cfg = json.loads((R / 'job.json').read_text(encoding='utf-8'))
t0 = time.time()
for f in (R / 'in').rglob('*'):
    if f.is_file():
        rel = f.relative_to(R / 'in')
        dst = W / (str(rel)[:-4] if f.suffix == '.bin' else str(rel))
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(xor(f.read_bytes()) if f.suffix == '.bin' else f.read_bytes())
(W / 'out').mkdir(exist_ok=True)
print('unpacked in %.0fs' % (time.time() - t0), flush=True)
r = subprocess.run(cfg['cmd'], cwd=W, shell=True)
print('command exit', r.returncode, ' minutes %.1f' % ((time.time() - t0) / 60), flush=True)
o = R / 'out'
o.mkdir(exist_ok=True)
n = 0
for f in (W / 'out').rglob('*'):
    if f.is_file():
        rel = f.relative_to(W / 'out')
        dst = o / (str(rel) + '.bin')
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(xor(f.read_bytes())); n += 1
(o / '_status.json').write_text(json.dumps({'exit': r.returncode, 'files': n, 'minutes': round((time.time() - t0) / 60, 1)}), encoding='utf-8')
sys.exit(0)
