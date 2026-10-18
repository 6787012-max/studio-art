# -*- coding: utf-8 -*-
"""
צילום אנימציית דפדפן לסרטון, פריים אחר פריים (דטרמיניסטי — לא תלוי במהירות המחשב).

הדף חייב לחשוף:  window.__ready (true כשהגופנים והתמונות נטענו)  ו-  window.__seek(שניות).
זו אותה מוסכמה של מנוע השורטים (anim/build.py), ולכן סצנות עוברות בין השניים.

    python tools/capture.py <scene.html> <out.mp4> --dur 7 [--fps 30] [--size 1280x720] [--audio speech.mp3] [--still 2.5 out.png]

בלי חלון, בלי כרטיס המסך (ציור תוכנה), קידוד libx264 על המעבד.
"""
import argparse
import os
import subprocess
import time

from playwright.sync_api import sync_playwright

# עדיפות סרק: הדפדפן ו-ffmpeg יורשים אותה, כך שהרינדור לא מכביד על המחשב
try:
    import psutil
    psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
except Exception:
    pass

NOWIN = getattr(subprocess, 'CREATE_NO_WINDOW', 0)
ap = argparse.ArgumentParser()
ap.add_argument('scene'); ap.add_argument('out')
ap.add_argument('--dur', type=float, required=True); ap.add_argument('--fps', type=int, default=30)
ap.add_argument('--size', default='1280x720'); ap.add_argument('--audio'); ap.add_argument('--still', nargs=2)
ap.add_argument('--browser', default='msedge')   # בשרת: chromium
a = ap.parse_args()
w, h = (int(v) for v in a.size.split('x'))
url = a.scene if '://' in a.scene else 'file:///' + os.path.abspath(a.scene).replace(os.sep, '/')
errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(channel=None if a.browser == 'chromium' else a.browser, headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--allow-file-access-from-files', '--ignore-gpu-blocklist'])
    try:
        pg = browser.new_page(viewport={'width': w, 'height': h})
        pg.on('pageerror', lambda e: errors.append(str(e)[:300]))
        pg.on('console', lambda m: errors.append(m.text[:300]) if m.type == 'error' else None)
        pg.goto(url, wait_until='load')
        pg.wait_for_function('window.__ready === true', timeout=30000)
        if a.still:
            pg.evaluate('window.__seek(%f)' % float(a.still[0]))
            pg.screenshot(path=a.still[1])
        cmd = ['ffmpeg', '-hide_banner', '-nostats', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', str(a.fps), '-c:v', 'mjpeg', '-i', '-']
        if a.audio:
            cmd += ['-i', a.audio, '-c:a', 'aac', '-b:a', '160k', '-shortest']
        cmd += ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-g', str(a.fps * 2), '-profile:v', 'high', '-level', '4.1', '-movflags', '+faststart', a.out]   # תמונת מפתח כל 2 שניות: ניגון חלק ב-PowerPoint
        ff = subprocess.Popen(cmd, stdin=subprocess.PIPE, creationflags=NOWIN)
        t0, n = time.time(), int(round(a.dur * a.fps))
        for i in range(n):
            pg.evaluate('window.__seek(%f)' % (i / a.fps))
            ff.stdin.write(pg.screenshot(type='jpeg', quality=93))
        ff.stdin.close()
        code = ff.wait()
        print('frames=%d  render_seconds=%.1f  ffmpeg_exit=%d  errors=%d' % (n, time.time() - t0, code, len(errors)))
        for e in errors[:5]:
            print('  page error:', e)
    finally:
        browser.close()
