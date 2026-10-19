# -*- coding: utf-8 -*-
"""Render the azamra342 films on the remote servers, one film after another, with automatic retry of failed parts.
    python productions/azamra342/render_all.py film_a film_b ... [--part 50]
For each film: read its real length (window.__dur) in a headless browser, render_parts.py, then retry_part.py
(split in two) for any part that failed, up to 2 rounds. Log: productions/azamra342/render/render_all.log"""
import io, json, os, re, subprocess, sys, time

try:
    import psutil
    psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
except Exception:
    pass
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
NOWIN = getattr(subprocess, 'CREATE_NO_WINDOW', 0)
args = [a for a in sys.argv[1:] if not a.startswith('--')]
PART = sys.argv[sys.argv.index('--part') + 1] if '--part' in sys.argv else '50'
args = [a for a in args if a != PART]
os.makedirs(os.path.join(HERE, 'render'), exist_ok=True)
LOG = os.path.join(HERE, 'render', 'render_all.log')


def log(s):
    line = time.strftime('%H:%M:%S ') + s
    io.open(LOG, 'a', encoding='utf-8').write(line + '\n'); print(line, flush=True)


def film_dur(film):
    from playwright.sync_api import sync_playwright
    url = 'file:///' + os.path.join(HERE, film + '.html').replace(os.sep, '/')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='msedge', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files', '--ignore-gpu-blocklist'])
        try:
            pg = b.new_page(viewport={'width': 640, 'height': 360})
            pg.goto(url, wait_until='load')
            pg.wait_for_function('window.__ready === true', timeout=600000)
            return float(pg.evaluate('window.__dur'))
        finally:
            b.close()


def probe(f):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True, creationflags=NOWIN)
    return float(r.stdout.strip() or 0)


summary = {}
for film in args:
    try:
        dur = round(film_dur(film), 3)
    except Exception as e:
        log('%s: could not read length: %s' % (film, e)); summary[film] = 'no length'; continue
    log('%s: length %.1fs, rendering (part %s s)' % (film, dur, PART))
    r = subprocess.run([sys.executable, os.path.join(HERE, 'render_parts.py'), film, str(dur), '--part', PART], cwd=ROOT,
                       capture_output=True, text=True, encoding='utf-8', errors='replace', creationflags=NOWIN)
    out = (r.stdout or '') + (r.stderr or '')
    for rnd in range(2):
        bad = sorted(set(int(x) for x in re.findall(r'FAILED part (\d+)', out)))
        if r.returncode == 0 and not bad:
            break
        log('%s: failed parts %s, retry round %d' % (film, bad or '?', rnd + 1))
        out = ''
        for i in bad:
            r = subprocess.run([sys.executable, os.path.join(HERE, 'retry_part.py'), film, str(dur), str(i), '--split', '2', '--part', PART], cwd=ROOT,
                               capture_output=True, text=True, encoding='utf-8', errors='replace', creationflags=NOWIN)
            out += (r.stdout or '') + (r.stderr or '')
            if r.returncode:
                out += '\nFAILED part %d\n' % i
    f = os.path.join(HERE, 'render', film, 'out.mp4')
    got = probe(f) if os.path.exists(f) else 0
    ok = got and abs(got - dur) < 1.0
    summary[film] = 'ok %.1fs' % got if ok else 'BAD (%.1fs of %.1fs)' % (got, dur)
    log('%s: %s' % (film, summary[film]))
log('DONE ' + json.dumps(summary, ensure_ascii=False))
