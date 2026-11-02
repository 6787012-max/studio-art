# -*- coding: utf-8 -*-
"""JPG stills (1920x1080) for a sod_hazman_v4 chapter. usage: python _stills_tool_b23.py <chapterId> [lineId ...] [--at 0.6]
One still per line id (time = t0 + at*(end-t0)) plus intro. Output: _stills_<chapterId>/<id>_t<time>.jpg. Idle priority, browser closed in finally."""
import json, os, sys
from playwright.sync_api import sync_playwright
try:
    import psutil
    psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
except Exception:
    pass
HERE = os.path.dirname(os.path.abspath(__file__)).replace(os.sep, '/')
args = sys.argv[1:]
ats = [0.6]
if '--at' in args:
    i = args.index('--at'); ats = [float(x) for x in args[i + 1].split(',')]; del args[i:i + 2]
cid = args[0]; only = set(args[1:])
tl = json.load(open(HERE + '/timeline.json', encoding='utf-8'))
ch = [c for c in tl['chapters'] if c['id'] == cid][0]
times = [('intro', 2.5)] if not only or 'intro' in only else []
for l in ch['lines']:
    if only and l['id'] not in only:
        continue
    e = l.get('end') or l['t1']
    for at in ats:
        times.append((l['id'], round(l['t0'] + at * (e - l['t0']), 2)))
out = HERE + '/_stills_' + cid
os.makedirs(out, exist_ok=True)
url = 'file:///' + HERE + '/' + cid + '.html?hq=1'
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--allow-file-access-from-files', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 1920, 'height': 1080})
        pg.add_init_script('window.__HQ_RENDER=true')
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        pg.goto(url, wait_until='load')
        pg.wait_for_function('window.__ready === true', timeout=600000)
        cleared = set()
        for name, t in times:
            pg.evaluate('window.__seek(%f)' % t)
            if name not in cleared:
                cleared.add(name)
                for f in os.listdir(out):
                    if f.startswith(name + '_t'):
                        os.remove(out + '/' + f)
            pg.screenshot(path='%s/%s_t%s.jpg' % (out, name, t), type='jpeg', quality=90)
            print('still', name, t)
        print('errors', len(errs), errs[:3])
    finally:
        b.close()
