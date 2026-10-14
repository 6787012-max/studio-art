# -*- coding: utf-8 -*-
"""
Runs on a GitHub runner (outside NetFree). Generates images with free Hugging Face Spaces
(FLUX) and writes them XOR-scrambled (key 0xA7) so NetFree does not recognise them as images
on the way back. The local tool (studio/tools/art_remote.py) unscrambles them.

    python gen.py <batch> [model-order]

requests/<batch>.json = {"jobs": [{"name", "prompt", "model"?, "seed"?, "w"?, "h"?, "ref"?}]}
model: flux-dev | flux-schnell | kontext (kontext edits refs/<ref>.bin = the reference image)
"""
import io
import json
import os
import shutil
import sys
import tempfile
import time
import traceback
from pathlib import Path

from gradio_client import Client, handle_file
from PIL import Image

KEY = 0xA7
xor = lambda b: bytes(x ^ KEY for x in b)
batch = sys.argv[1]
order = (sys.argv[2] if len(sys.argv) > 2 else 'flux-dev,flux-schnell').split(',')
req = json.load(io.open('requests/%s.json' % batch, encoding='utf-8'))
out = Path('out') / batch
out.mkdir(parents=True, exist_ok=True)
tmp = Path(tempfile.mkdtemp())


def ref_path(name):
    p = tmp / ('ref_%s.png' % name)
    if not p.exists():
        p.write_bytes(xor(Path('refs/%s.bin' % name).read_bytes()))
    return str(p)


SPACES = {
    'flux-dev': ('black-forest-labs/FLUX.1-dev', '/infer',
                 lambda j: dict(prompt=j['prompt'], seed=j.get('seed', 0), randomize_seed=False, width=j.get('w', 1024),
                                height=j.get('h', 1024), guidance_scale=j.get('guidance', 3.5), num_inference_steps=j.get('steps', 28))),
    'flux-schnell': ('black-forest-labs/FLUX.1-schnell', '/infer',
                     lambda j: dict(prompt=j['prompt'], seed=j.get('seed', 0), randomize_seed=False, width=j.get('w', 1024),
                                    height=j.get('h', 1024), num_inference_steps=4)),
    'kontext': ('black-forest-labs/FLUX.1-Kontext-Dev', '/infer',
                lambda j: dict(input_image=handle_file(ref_path(j['ref'])), prompt=j['prompt'], seed=j.get('seed', 0),
                               randomize_seed=False, guidance_scale=j.get('guidance', 2.5), steps=j.get('steps', 28))),
}
clients = {}


def client(model):
    space = SPACES[model][0]
    if space not in clients:
        tok = os.environ.get('HF_TOKEN') or None
        try:
            clients[space] = Client(space, token=tok, verbose=False)
        except TypeError:
            clients[space] = Client(space, hf_token=tok, verbose=False)
        try:
            print(str(clients[space].view_api(return_format='dict'))[:3000])
        except Exception as e:
            print('view_api failed:', e)
    return clients[space]


def to_png(res):
    if isinstance(res, (list, tuple)):
        res = res[0]
    if isinstance(res, dict):
        res = res.get('path') or res.get('url') or res.get('image')
    im = Image.open(res).convert('RGB')
    b = io.BytesIO()
    im.save(b, 'PNG')
    return b.getvalue(), im.size


log = []
for j in req['jobs']:
    models = [j['model']] if j.get('model') else order
    rec = {'name': j['name'], 'ok': False, 'tries': []}
    for m in models:
        t0 = time.time()
        try:
            space, api, args = SPACES[m]
            res = client(m).predict(api_name=api, **args(j))
            png, size = to_png(res)
            (out / ('%s.bin' % j['name'])).write_bytes(xor(png))
            rec.update(ok=True, model=m, size=size, seconds=round(time.time() - t0, 1))
            print('OK  %-24s %s %s %.1fs' % (j['name'], m, size, time.time() - t0), flush=True)
            break
        except Exception as e:
            msg = ('%s: %s' % (type(e).__name__, e))[:400]
            rec['tries'].append({'model': m, 'error': msg})
            print('ERR %-24s %s %s' % (j['name'], m, msg), flush=True)
            traceback.print_exc(limit=1)
    log.append(rec)

(out / 'log.json').write_text(json.dumps(log, ensure_ascii=False, indent=1), encoding='utf-8')
print('done: %d/%d' % (sum(r['ok'] for r in log), len(log)))
