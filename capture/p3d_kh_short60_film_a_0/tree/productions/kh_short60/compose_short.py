# -*- coding: utf-8 -*-
"""Local mix for the pilot short: remote 3D render (silent) + the real voice (never uploaded) + music + the existing end card.
Reuses the proven audio chain of the old shorts builder (anim/build.py): same cut ranges, loudnorm, music envelope.
Usage: python compose_short.py <render_out.mp4> <final.mp4>   (runs at idle priority, no window)"""
import sys, os, json, subprocess, io
try:
    import psutil
    psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
except Exception:
    pass
SHORTS = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools'
sys.path.insert(0, SHORTS)
os.chdir(SHORTS)
import pipeline as P  # guarded dispatch (same import as anim/build.py)

render, final = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
cfg = json.load(io.open(SHORTS + '/work/short60_config.json', encoding='utf-8'))
D = SHORTS + '/anim/short60'
WORK = os.path.dirname(final) + '/_compose_work'
os.makedirs(WORK, exist_ok=True)
FPS, END_DUR = 30, 4.8
pre = cfg.get('pre_roll', 0.15)
keep = P.compute_keep_ranges(cfg['seg_start_t'] - pre, cfg['seg_end_t'] + cfg.get('tail', 1.0), cfg.get('cut_ranges', []))
clip = sum(b - a for a, b in keep)
total = clip + END_DUR
print('clip %.2f + end %.1f = %.2f' % (clip, END_DUR, total), flush=True)

# 1) end card frames from the old 2D engine (only t >= clip is drawn by it)
outro = WORK + '/outro.mp4'
if not os.path.exists(outro):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        try:
            pg = b.new_page(viewport={'width': 1080, 'height': 1920})
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto('file:///' + D + '/index.html')
            print('fonts:', pg.evaluate('window.__ready'), flush=True)
            ff = subprocess.Popen([P.FF, '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                                   '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'veryfast', outro], stdin=subprocess.PIPE)
            n = int(round(END_DUR * FPS))
            for i in range(n):
                pg.evaluate('window.__seek(%f)' % (clip + i / FPS))
                ff.stdin.write(pg.screenshot(type='jpeg', quality=92))
            ff.stdin.close(); ff.wait()
            if errs: sys.exit('JS error in end card: ' + ' | '.join(errs[:2]))
        finally:
            b.close()

# 2) audio: same cuts / loudnorm / music as anim/build.py
narr = WORK + '/narr_stereo.wav'
P.extract_with_cuts(cfg['local_mp4'], keep, 2, 44100, narr)
nf = 'anull'
if cfg.get('loudnorm'):
    ln = cfg['loudnorm'] if isinstance(cfg['loudnorm'], dict) else {}
    nf = 'loudnorm=I=%s:TP=%s:LRA=%s' % (ln.get('I', -16.5), ln.get('TP', -2.0), ln.get('LRA', 7))
music = cfg.get('music_track', P.DEFAULT_MUSIC)
mv, mve, ms = cfg.get('music_vol', 0.16), cfg.get('music_end_vol', 0.85), cfg.get('music_start', 0)
env = '%s+(%s-%s)*min(1,max(0,(t-%.3f)/0.9))' % (mv, mve, mv, clip - 0.3)
filt = ('[0:a]%s,aresample=44100,apad=whole_dur=%.3f[n];'
        '[1:a]atrim=start=%.3f,asetpts=PTS-STARTPTS,atrim=0:%.3f,volume=\'%s\':eval=frame,'
        'afade=t=in:st=0:d=1.2,afade=t=out:st=%.3f:d=1.4,aresample=44100[m];'
        '[n][m]amix=inputs=2:duration=first:normalize=0[a]') % (nf, total, ms, total, env, total - 1.4)
mixa = WORK + '/mix.m4a'
subprocess.run([P.FF, '-v', 'error', '-y', '-i', narr, '-stream_loop', '-1', '-i', music, '-filter_complex', filt,
                '-map', '[a]', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-t', '%.3f' % total, mixa], check=True)

# 3) 3D render (trimmed to the clip length) + end card + audio
vf = ('[0:v]trim=0:%.3f,setpts=PTS-STARTPTS,scale=1080:1920,fps=%d,format=yuv420p[a];'
      '[1:v]scale=1080:1920,fps=%d,format=yuv420p[b];[a][b]concat=n=2:v=1:a=0[v]') % (clip, FPS, FPS)
subprocess.run([P.FF, '-v', 'error', '-y', '-i', render, '-i', outro, '-i', mixa, '-filter_complex', vf, '-map', '[v]', '-map', '2:a',
                '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-c:a', 'copy', '-t', '%.3f' % total, '-movflags', '+faststart', final], check=True)
print('done', final, '%.2fs' % P.ffprobe_duration(final))
