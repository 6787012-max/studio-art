# -*- coding: utf-8 -*-
"""
הרכבת סרט מאיורים: כל סצנה = קטע תנועה (אם יש) + תמונה עם תנועת מצלמה איטית (Ken Burns),
מעברים רכים בין סצנות, כתוביות עבריות מסונכרנות למילים, ופס קול מוכן.

    python tools/assemble.py <edl.json> <out.mp4> [--from N --to M]   (--from/--to: רק חלק מהסצנות, לבדיקה)

edl.json:
{ "audio": "...wav", "duration": 229.0, "assets": "dir", "clips": "dir",
  "words": "...json", "word_shift": [[t_from, -6.58], [20.44, -9.66]], "drop_ranges": [[17.36, 20.44]], "drop_tokens": ["ה"],
  "titles": [{"t0": 0.3, "t1": 5.6, "text": "...", "style": "Title"}],
  "scenes": [{"t": 0.0, "img": "p12_title", "clip": "v_x"?, "move": "in|out|left|right|up|down", "cx": 0.5, "cy": 0.45}] }
"""
import argparse
import io
import json
import math
import os
import subprocess
import time

try:
    import psutil
    psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
except Exception:
    pass

NOWIN = getattr(subprocess, 'CREATE_NO_WINDOW', 0)
FPS, X, CX = 30, 0.5, 0.4      # קצב פריימים, מעבר בין סצנות, מעבר מקטע התנועה לתמונה


def ff(args):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y'] + args, capture_output=True, text=True,
                       encoding='utf-8', errors='replace', creationflags=NOWIN)
    if r.returncode:
        raise SystemExit('ffmpeg failed:\n' + r.stderr[-2500:])


MOVES = {   # (zoom from, zoom to, center x from, to, center y from, to) — יחסית למרכז שנבחר
    'in': (1.0, 1.13, 0, 0, 0, 0), 'out': (1.13, 1.0, 0, 0, 0, 0),
    'left': (1.12, 1.12, .05, -.05, 0, 0), 'right': (1.12, 1.12, -.05, .05, 0, 0),
    'up': (1.12, 1.12, 0, 0, .05, -.05), 'down': (1.12, 1.12, 0, 0, -.05, .05),
    'in_slow': (1.0, 1.06, 0, 0, 0, 0),
}


def kenburns(img, L, move, cx, cy, out):
    N = max(2, int(round(L * FPS)))
    z0, z1, dx0, dx1, dy0, dy1 = MOVES[move]
    e = '(0.5-0.5*cos(PI*on/%d))' % N
    z = '(%f+(%f)*%s)' % (z0, z1 - z0, e)
    xc = '(%f+(%f)*%s)' % (cx + dx0, dx1 - dx0, e)
    yc = '(%f+(%f)*%s)' % (cy + dy0, dy1 - dy0, e)
    vf = ('scale=2880:1620:force_original_aspect_ratio=increase:flags=lanczos,crop=2880:1620,'
          "zoompan=z='%s':x='max(0,min(iw-iw/zoom,iw*%s-iw/zoom/2))':y='max(0,min(ih-ih/zoom,ih*%s-ih/zoom/2))'"
          ':d=%d:s=1920x1080:fps=%d,format=yuv420p') % (z, xc, yc, N, FPS)
    ff(['-i', img, '-vf', vf, '-frames:v', str(N), '-c:v', 'libx264', '-crf', '15', '-preset', 'veryfast', out])


def clipseg(clip, L, out):
    vf = 'fps=%d,scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,unsharp=5:5:0.55,tpad=stop_mode=clone:stop_duration=30,format=yuv420p' % FPS
    ff(['-i', clip, '-vf', vf, '-t', '%.3f' % L, '-c:v', 'libx264', '-crf', '15', '-preset', 'veryfast', out])


def clipdur(clip):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', clip], capture_output=True, text=True, creationflags=NOWIN)
    return float(r.stdout.strip())


def ass_time(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return '%d:%02d:%05.2f' % (h, m, s)


def build_ass(e, path):
    words = json.load(io.open(e['words'], encoding='utf-8'))
    shift = sorted(e.get('word_shift', []))
    def A(t):
        d = 0
        for t0, dd in shift:
            if t >= t0: d = dd
        return t + d
    drops = e.get('drop_ranges', []); dtok = set(e.get('drop_tokens', []))
    ws = [(A(w['t']), w['w']) for w in words if w['w'] not in dtok and not any(a <= w['t'] < b for a, b in drops)]
    lines, cur = [], []
    for i, (t, w) in enumerate(ws):
        cur.append((t, w))
        nxt = ws[i + 1][0] if i + 1 < len(ws) else None
        if len(cur) >= 7 or w.endswith(('.', '?', ':', '!')) or (nxt is not None and nxt - t > .9) or (len(cur) >= 4 and w.endswith((',', '-'))):
            lines.append(cur); cur = []
    if cur: lines.append(cur)
    ev = []
    for i, ln in enumerate(lines):
        t0 = ln[0][0] - .05
        t1 = min(lines[i + 1][0][0] - .05 if i + 1 < len(lines) else ln[-1][0] + 1.2, ln[-1][0] + 1.4)
        ev.append('Dialogue: 0,%s,%s,Sub,,0,0,0,,%s' % (ass_time(t0), ass_time(t1), ' '.join(w for _, w in ln)))
    for tt in e.get('titles', []):
        ev.append('Dialogue: 1,%s,%s,%s,,0,0,0,,{\\fad(400,400)}%s' % (ass_time(tt['t0']), ass_time(tt['t1']), tt.get('style', 'Title'), tt['text']))
    head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Assistant,66,&H00FFFFFF,&H00FFFFFF,&H00101010,&H96000000,1,0,0,0,100,100,0,0,1,4.5,2,2,120,120,62,177
Style: Title,Secular One,128,&H00FFFFFF,&H00FFFFFF,&H00141E3A,&H96000000,0,0,0,0,100,100,0,0,1,6,3,8,80,80,120,177
Style: Kicker,Assistant,54,&H0050C8FF,&H00FFFFFF,&H00101010,&H96000000,1,0,0,0,100,100,1,0,1,4,2,8,80,80,280,177
Style: End,Secular One,110,&H00FFFFFF,&H00FFFFFF,&H00141E3A,&H96000000,0,0,0,0,100,100,0,0,1,6,3,5,80,80,0,177

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    io.open(path, 'w', encoding='utf-8-sig').write(head + '\n'.join(ev) + '\n')
    return len(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('edl'); ap.add_argument('out')
    ap.add_argument('--from', dest='a', type=int, default=0); ap.add_argument('--to', dest='b', type=int)
    a = ap.parse_args()
    e = json.load(io.open(a.edl, encoding='utf-8'))
    work = os.path.splitext(a.out)[0] + '_work'
    os.makedirs(work, exist_ok=True)
    sc = e['scenes']; D = e['duration']
    idx = list(range(len(sc)))[a.a:a.b]
    t0 = time.time(); segs = []
    for k in idx:
        s = sc[k]; start = s['t']; end = sc[k + 1]['t'] if k + 1 < len(sc) else D
        L = end - start + (X if k + 1 < len(sc) and k != idx[-1] else 0)
        img = os.path.join(e['assets'], s['img'] + '.png'); out = os.path.join(work, 'seg%02d.mp4' % k)
        clip = os.path.join(e['clips'], s['clip'] + '.mp4') if s.get('clip') else None
        move, cx, cy = s.get('move', 'in'), s.get('cx', .5), s.get('cy', .5)
        if clip and os.path.exists(clip):
            cd = clipdur(clip)
            if L <= cd + 1.2:
                clipseg(clip, L, out)
            else:
                c1, k1 = out + '.c.mp4', out + '.k.mp4'
                clipseg(clip, cd, c1)
                kenburns(img, L - cd + CX, move, cx, cy, k1)
                ff(['-i', c1, '-i', k1, '-filter_complex', '[0][1]xfade=transition=fade:duration=%f:offset=%f,format=yuv420p' % (CX, cd - CX),
                    '-c:v', 'libx264', '-crf', '15', '-preset', 'veryfast', out])
        else:
            if clip: print('  (no clip yet: %s)' % os.path.basename(clip))
            kenburns(img, L, move, cx, cy, out)
        segs.append((out, L))
        print('seg %02d  %-16s %5.1fs  [%s]  total %.0fs' % (k, s['img'], L, 'clip+kb' if clip and os.path.exists(clip) else move, time.time() - t0), flush=True)

    # חיבור במעברים רכים
    inputs, fc, prev, off = [], [], '[0:v]', 0.0
    for i, (p, L) in enumerate(segs):
        inputs += ['-i', p]
    acc = segs[0][1]
    for i in range(1, len(segs)):
        off = acc - X
        lbl = '[x%d]' % i
        fc.append('%s[%d:v]xfade=transition=fade:duration=%f:offset=%f%s' % (prev, i, X, off, lbl))
        prev = lbl; acc = off + segs[i][1]
    ass = os.path.join(work, 'subs.ass').replace('\\', '/')
    nl = build_ass(e, ass)
    ass_f = ass.replace(':', '\\:')
    fd = ''
    if e.get('fontsdir'):   # בשרת: הגופנים העבריים מגיעים מתיקייה, לא מהמערכת
        fd = ":fontsdir='%s'" % e['fontsdir'].replace(':', '\\:')
    fc.append('%sass=\'%s\'%s,format=yuv420p[v]' % (prev, ass_f, fd))
    t_start = sc[idx[0]]['t']; t_len = acc
    cmd = inputs + ['-ss', '%.3f' % t_start, '-t', '%.3f' % t_len, '-i', e['audio'], '-filter_complex', ';'.join(fc),
                    '-map', '[v]', '-map', '%d:a' % len(segs), '-c:v', 'libx264', '-crf', '19', '-preset', 'medium',
                    '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-shortest', a.out]
    if a.a or a.b:   # קטע בדיקה: הכתוביות מוזזות לזמן הקטע
        cmd = [c.replace("ass='%s'" % ass_f, "setpts=PTS+%f/TB,ass='%s',setpts=PTS-STARTPTS" % (t_start, ass_f)) for c in cmd]
    ff(cmd)
    print('done %s  segments=%d  subtitle_lines=%d  length=%.1fs  minutes=%.1f' % (a.out, len(segs), nl, t_len, (time.time() - t0) / 60))


if __name__ == '__main__':
    main()
