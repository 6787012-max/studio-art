# -*- coding: utf-8 -*-
"""Join the six rendered films, lay the composed music under them, and write a viewing page.
    python productions/azamra342/assemble_final.py
In : productions/azamra342/render/film_<a,b,c,d,e,z>/out.mp4, music in C:/projects/azamra-lishmecha/lessons/342/music/
Out: C:/projects/azamra-lishmecha/lessons/342/out/<name>.mp4 + צפייה.html (video + script by part, click a part to jump)"""
import html, io, json, os, re, subprocess, sys

try:
    import psutil
    psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
except Exception:
    pass
HERE = os.path.dirname(os.path.abspath(__file__)).replace(os.sep, '/')
LESSON = 'C:/projects/azamra-lishmecha/lessons/342'
OUT = LESSON + '/out'; os.makedirs(OUT, exist_ok=True)
NAME = 'ותן טל ומטר - שכחתי, מה עושים'
NOWIN = getattr(subprocess, 'CREATE_NO_WINDOW', 0)
FILMS = [('film_a', 'פתיחה'), ('film_b', "חלק א' — בני אשכנז"), ('film_c', "חלק ב' — בני ספרד"),
         ('film_d', "חלק ג' — שאלות ותשובות"), ('film_e', "חלק ד' — לא בטוח אם אמר?"), ('film_z', 'סיום')]


def probe(f, what='format=duration'):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', what, '-of', 'csv=p=0', f], capture_output=True, text=True, creationflags=NOWIN)
    return r.stdout.strip()


parts, starts, t = [], [], 0.0
for fid, title in FILMS:
    f = HERE + '/render/%s/out.mp4' % fid
    if not os.path.exists(f):
        sys.exit('missing ' + f)
    d = float(probe(f))
    parts.append(f); starts.append((t, title, fid)); t += d
total = t
has_audio = [bool(probe(f, 'stream=codec_type').count('audio')) for f in parts]
print('total %.1fs, parts with sound: %s' % (total, has_audio))

# music: tal_main under the opening + Ashkenaz, tal_warm from the Sefard part to the end, with a crossfade
switch = starts[2][0]
cmd = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y']
for f in parts:
    cmd += ['-i', f]
cmd += ['-stream_loop', '-1', '-i', LESSON + '/music/tal_main.mp3', '-stream_loop', '-1', '-i', LESSON + '/music/tal_warm.mp3']
n = len(parts)
fc = []
for i in range(n):
    fc.append('[%d:v]fps=30,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p[v%d]' % (i, i))
    if has_audio[i]:
        fc.append('[%d:a]aresample=44100,aformat=channel_layouts=stereo[a%d]' % (i, i))
    else:
        fc.append('anullsrc=r=44100:cl=stereo,atrim=0:%s[a%d]' % (probe(parts[i]), i))
fc.append(''.join('[v%d][a%d]' % (i, i) for i in range(n)) + 'concat=n=%d:v=1:a=1[vv][fx]' % n)
fc.append('[%d:a]atrim=0:%.3f,asetpts=PTS-STARTPTS,volume=0.42,afade=t=in:d=1.5,afade=t=out:st=%.3f:d=2.5[m1]' % (n, switch + 1.5, switch - 1.0))
fc.append('[%d:a]atrim=0:%.3f,asetpts=PTS-STARTPTS,volume=0.46,afade=t=in:d=2.5,afade=t=out:st=%.3f:d=3,adelay=%d|%d[m2]'
          % (n + 1, total - switch + 1.0, total - switch - 3.0, int((switch - 1.0) * 1000), int((switch - 1.0) * 1000)))
fc.append('[fx][m1][m2]amix=inputs=3:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11[aa]')
final = OUT + '/' + NAME + '.mp4'
cmd += ['-filter_complex', ';'.join(fc), '-map', '[vv]', '-map', '[aa]', '-t', '%.2f' % total,
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-profile:v', 'high', '-level', '4.1', '-g', '60', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', final]
r = subprocess.run(cmd, capture_output=True, text=True, creationflags=NOWIN)
if r.returncode:
    sys.exit('ffmpeg failed: ' + (r.stderr or '')[-800:])
got = float(probe(final))
print('final %.1fs (expected %.1f), %.1f MB' % (got, total, os.path.getsize(final) / 1e6))

# viewing page: the video + the script of each part (captions from BRIEF.md), click a part to jump there
brief = io.open(HERE + '/BRIEF.md', encoding='utf-8').read()
def caps_of(letter):
    sec = re.search(r'### film_%s .*?(?=\n### |\n## )' % letter, brief, re.S)
    out = []
    for line in (sec.group(0) if sec else '').splitlines():
        if 'caps:' in line:
            out += [c.strip().strip('"').replace('\\"', '"') for c in re.findall(r'"((?:[^"\\]|\\.)*)"', line.split('caps:', 1)[1])]
    return out
rows = []
for (t0, title, fid) in starts:
    caps = ''.join('<li>%s</li>' % html.escape(c) for c in caps_of(fid[-1]))
    rows.append('<section><h2><a href="#" onclick="go(%.2f);return false">%s <span>%d:%02d</span></a></h2><ul>%s</ul></section>'
                % (t0, html.escape(title), int(t0 // 60), int(t0 % 60), caps))
page = '''<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ותן טל ומטר</title><style>
body{margin:0;background:#f6f3ea;color:#222;font:16px/1.6 Arial,sans-serif}main{max-width:1100px;margin:auto;padding:16px}
h1{font-size:26px;margin:8px 0}p.s{color:#666;margin:0 0 12px}video{width:100%%;border-radius:12px;background:#000}
section{background:#fff;border-radius:10px;padding:8px 16px;margin:10px 0;box-shadow:0 1px 3px rgba(0,0,0,.08)}
h2{font-size:18px;margin:6px 0}h2 a{color:#1a5f8a;text-decoration:none}h2 span{color:#999;font-weight:normal;font-size:14px}ul{margin:4px 0 8px}
</style><main><h1>ותן טל ומטר — שכחתי, מה עושים?</h1><p class="s">על פי הגיליון "אזמרה לשמך" מס' 342 · %d:%02d דקות · לחיצה על שם החלק קופצת אליו</p>
<video id="v" src="%s" controls preload="metadata"></video>%s</main>
<script>function go(t){const v=document.getElementById('v');v.currentTime=t;v.play();window.scrollTo({top:0,behavior:'smooth'});}</script></html>''' % (
    int(total // 60), int(total % 60), html.escape(NAME + '.mp4'), ''.join(rows))
io.open(OUT + '/צפייה.html', 'w', encoding='utf-8').write(page)
print('page', OUT + '/צפייה.html')
