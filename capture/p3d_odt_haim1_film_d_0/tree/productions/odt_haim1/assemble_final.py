# -*- coding: utf-8 -*-
"""Join the rendered odt_haim1 films and lay a music bed under them (no narration).
    python productions/odt_haim1/assemble_final.py
In : productions/odt_haim1/render/film_<a,b,c,d,e,z>/out.mp4 ; music: the two composed beds of azamra342 (ours), alternating with crossfades.
Out: C:/team_workspace/haim_katz_lesson_20261020/<out dir>/<name>.mp4"""
import os, subprocess, sys

try:
    import psutil
    psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
except Exception:
    pass
HERE = os.path.dirname(os.path.abspath(__file__)).replace(os.sep, '/')
MUSIC = 'C:/projects/azamra-lishmecha/lessons/342/music'
OUT = 'C:/team_workspace/haim_katz_lesson_20261020/\u05ea\u05d5\u05e6\u05e8\u05d9\u05dd'
NAME = '\u05e1\u05d3\u05e0\u05d4 \u05e9\u05de\u05d5\u05e9\u05db\u05ea - \u05d4\u05e9\u05d9\u05e2\u05d5\u05e8 \u05d4\u05e8\u05d0\u05e9\u05d5\u05df'
NOWIN = getattr(subprocess, 'CREATE_NO_WINDOW', 0)
FILMS = ['film_a', 'film_b', 'film_c', 'film_d', 'film_e', 'film_z']


def probe(f, what='format=duration'):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', what, '-of', 'csv=p=0', f], capture_output=True, text=True, creationflags=NOWIN)
    return r.stdout.strip()


parts, total = [], 0.0
for fid in FILMS:
    f = HERE + '/render/%s/out.mp4' % fid
    if not os.path.exists(f):
        sys.exit('missing ' + f)
    parts.append(f); total += float(probe(f))
print('total %.1fs' % total)

cmd = ['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y']
for f in parts:
    cmd += ['-i', f]
n = len(parts)
# music bed: main, warm, main, warm, main ... each joined with a 4 s crossfade, until longer than the film
beds, have = [], 0.0
tracks = [(MUSIC + '/tal_main.mp3', float(probe(MUSIC + '/tal_main.mp3'))), (MUSIC + '/tal_warm.mp3', float(probe(MUSIC + '/tal_warm.mp3')))]
while have < total + 6:
    p, d = tracks[len(beds) % 2]
    beds.append(p); have += d - (4 if beds[1:] else 0)
for p in beds:
    cmd += ['-i', p]
fc = []
for i in range(n):
    fc.append('[%d:v]fps=30,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p[v%d]' % (i, i))
fc.append(''.join('[v%d]' % i for i in range(n)) + 'concat=n=%d:v=1:a=0[vv]' % n)
prev = '%d:a' % n
for j in range(1, len(beds)):
    fc.append('[%s][%d:a]acrossfade=d=4:c1=tri:c2=tri[m%d]' % (prev, n + j, j)); prev = 'm%d' % j
fc.append('[%s]atrim=0:%.3f,asetpts=PTS-STARTPTS,volume=0.5,afade=t=in:d=2,afade=t=out:st=%.3f:d=4,loudnorm=I=-16:TP=-1.5:LRA=11[aa]'
          % (prev, total, total - 4))
os.makedirs(OUT, exist_ok=True)
final = OUT + '/' + NAME + '.mp4'
cmd += ['-filter_complex', ';'.join(fc), '-map', '[vv]', '-map', '[aa]', '-t', '%.2f' % total,
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-profile:v', 'high', '-level', '4.1', '-g', '60', '-pix_fmt', 'yuv420p',
        '-threads', '4', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', final]
r = subprocess.run(cmd, capture_output=True, text=True, creationflags=NOWIN)
if r.returncode:
    sys.exit('ffmpeg failed rc=%d: ' % r.returncode + (r.stderr or r.stdout or '')[-1500:])
print('final %.1fs (expected %.1f), %.1f MB -> %s' % (float(probe(final)), total, os.path.getsize(final) / 1e6, final.encode('ascii', 'backslashreplace').decode()))
