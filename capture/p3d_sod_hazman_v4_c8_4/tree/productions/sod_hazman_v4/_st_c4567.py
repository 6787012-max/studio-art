# -*- coding: utf-8 -*-
"""Quick JPG stills for chapters c4..c7 (builder tool). usage: python _st_c4567.py <chapterId> name:time [name:time ...]  |  <chapterId> --lines L02 L03 [--at 0.6]
Output: _stills_<chapterId>/<name>_t<time>.jpg ; prints page errors + console errors. Idle priority, browser closed in finally."""
import json, os, sys
from playwright.sync_api import sync_playwright
try:
    import psutil
    psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
except Exception:
    pass
HERE = os.path.dirname(os.path.abspath(__file__)).replace(os.sep, '/')
sys.path.insert(0, HERE + '/../../tools')
args = sys.argv[1:]
cid = args[0]
at = 0.6
if '--at' in args:
    i = args.index('--at'); at = float(args[i + 1]); del args[i:i + 2]
times = []
if '--lines' in args:
    i = args.index('--lines'); ids = args[i + 1:]
    tl = json.load(open(HERE + '/timeline.json', encoding='utf-8'))
    ch = [c for c in tl['chapters'] if c['id'] == cid][0]
    for l in ch['lines']:
        if ids and ids != ['all'] and l['id'] not in ids:
            continue
        e = l.get('end') or l['t1']
        times.append((l['id'], round(l['t0'] + at * (e - l['t0']), 2)))
else:
    for s in args[1:]:
        n, t = s.split(':'); times.append((n, float(t)))
out = HERE + '/_stills_' + cid
os.makedirs(out, exist_ok=True)
url = 'file:///' + HERE + '/' + cid + '.html?hq=1'
try:
    pass
except Exception as e:
    print('no heavy lock', e)
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--allow-file-access-from-files', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 1920, 'height': 1080})
        pg.add_init_script('window.__HQ_RENDER=true')
        errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(getattr(e,'stack',e))[:700]))
        pg.on('console', lambda m: errs.append(m.type + ' ' + m.text[:300]) if m.type in ('error', 'warning') else None)
        pg.goto(url, wait_until='commit', timeout=240000)
        try:
            pg.wait_for_function('window.__ready === true', timeout=240000)
        except Exception:
            print('NOT READY'); [print('  ', e) for e in errs[:12]]; raise SystemExit(2)
        for name, t in times:
            pg.evaluate('window.__seek(%f)' % t)
            for f in os.listdir(out):
                if f.startswith(name + '_t'):
                    os.remove(out + '/' + f)
            pg.screenshot(path='%s/%s_t%s.jpg' % (out, name, t), type='jpeg', quality=88)
            print('still', name, t, flush=True)
        print('errors', len(errs)); [print('  ', e) for e in errs[:14]]
    finally:
        b.close()
