# -*- coding: utf-8 -*-
"""Arachin v3 (morning lesson 05:50): real night-city open + 3D film_e (remote render) + real sunrise close with logo and final sentence.
    python build_v3.py     -> Y:/offload-from-D/daf-yomi-arachin-20261112/video-v3/arachin-v3-portrait.mp4 and -landscape.mp4
No people on screen. Narration: Gemini Live Charon (narrate_v3.py). No evening times anywhere."""
import io, json, os, subprocess, sys, wave
import numpy as np
try:
    import psutil
    psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
except Exception:
    pass
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HERE = os.path.dirname(os.path.abspath(__file__)).replace('\\', '/')
CAPS = HERE + '/../_caps_arachin_v3'
ASS = CAPS + '/ass'
WORK = HERE + '/_work'
OUT = 'Y:/offload-from-D/daf-yomi-arachin-20261112/video-v3'
FILM = HERE + '/render/film_e/out.mp4'
SFX = 'C:/projects/toldot-eretz-yisrael/v2/kit/sfx'
CITY = 'D:/video-projects/_assets/video/mixkit_city/01_49845-1080.mp4'
SUN = 'D:/video-projects/_assets/video/mixkit_beach/01_2168-1080.mp4'
LOGO = 'C:/projects/logo-minyan-tzeirim/logo7-png/horizontal-dark-transparent@2400.png'
MUSIC = 'D:/video-projects/_assets/music/04_calm/Energizing.mp3'
OPEN, T_IN, T_OUT, CLOSE = 3.0, 0.4, 36.0, 5.0   # real open, 3D window inside film_e, real close
FS = 'Assistant ExtraBold'


def sh(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, **kw)
    if r.returncode:
        raise SystemExit('FAILED: %s\n%s' % (' '.join(map(str, cmd))[:300], r.stderr.decode('utf-8', 'replace')[-700:]))
    return r


def wdur(p):
    with wave.open(p, 'rb') as w:
        return w.getnframes() / w.getframerate()


def hdr():
    return ('[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\n\n[V4+ Styles]\n'
            'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\n'
            'Style: K,%s,118,&H00E5F1F6,&H00E5F1F6,&H00220E08,&H80000000,0,0,0,0,100,100,0,0,1,9,3,5,60,60,0,1\n'
            'Style: S,%s,92,&H00E5F1F6,&H00E5F1F6,&H00220E08,&H80000000,0,0,0,0,100,100,0,0,1,8,3,5,60,60,0,1\n'
            'Style: G,%s,100,&H0066C9F3,&H0066C9F3,&H00220E08,&H80000000,0,0,0,0,100,100,0,0,1,8,3,5,60,60,0,1\n\n'
            '[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n') % (FS, FS, FS)


def tm(x):
    return '0:00:%05.2f' % x


def pop(x, y, t0, t1, style, text):
    return 'Dialogue: 0,%s,%s,%s,,0,0,0,,{\\pos(540,%d)\\fad(250,250)\\fscx80\\fscy80\\t(0,400,\\fscx100\\fscy100)}%s\n' % (tm(t0), tm(t1), style, y, text)


def real(src, ss, d, pan, ass_name, events, out, extra=''):
    os.makedirs(ASS, exist_ok=True)
    io.open(ASS + '/' + ass_name, 'w', encoding='utf-8-sig').write(hdr() + events)
    vf = ("fps=30,scale=-2:2000:flags=lanczos,crop=1080:1920:x='(iw-1080)/2+(%d)*(t/%.2f-0.5)':y='(ih-1920)/2'," % (pan, d) +
          "eq=contrast=1.07:saturation=1.12:brightness=-0.02,unsharp=5:5:0.5,vignette=PI/5,format=yuv420p" + extra +
          ",ass=%s:fontsdir=fonts" % ass_name)
    sh(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(ss), '-t', '%.3f' % d, '-i', src, '-vf', vf, '-r', '30', '-an',
        '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', out], cwd=ASS)


def main():
    S = json.load(io.open(CAPS + '/script.json', encoding='utf-8'))['e']
    os.makedirs(WORK, exist_ok=True); os.makedirs(OUT, exist_ok=True)
    assert os.path.exists(FILM), 'render missing'
    s0, s1, s2 = WORK + '/seg0.mp4', WORK + '/seg1.mp4', WORK + '/seg2.mp4'
    # 1) real night open, caption
    real(CITY, 4.0, OPEN, 300, 'open.ass', pop(540, 1330, 0.2, OPEN - 0.05, 'K', 'כשהעיר עוד ישנה'), s0)
    # 2) 3D film window
    d1 = T_OUT - T_IN
    sh(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(T_IN), '-t', '%.3f' % d1, '-i', FILM, '-vf', 'fps=30,scale=1080:1920,format=yuv420p',
        '-r', '30', '-an', '-c:v', 'libx264', '-crf', '17', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', s1])
    # 3) real sunrise close: final sentence + logo
    ev = (pop(540, 640, 0.3, CLOSE, 'K', 'שיעור הדף היומי') + pop(540, 800, 0.8, CLOSE, 'G', 'כל בוקר ב-05:50') +
          pop(540, 1000, 1.3, CLOSE, 'S', 'מסכת ערכין מתחילה\\Nביום חמישי ח׳ בכסלו'))
    real(SUN, 3.0, CLOSE, -300, 'close.ass', ev, WORK + '/seg2_raw.mp4')
    sh(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', WORK + '/seg2_raw.mp4', '-i', LOGO, '-filter_complex',
        '[1:v]scale=700:-1,format=rgba,fade=t=in:st=1.6:d=0.5:alpha=1[l];[0:v][l]overlay=(W-w)/2:1530:shortest=1,format=yuv420p', '-r', '30', '-c:v', 'libx264',
        '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', s2])
    lst = WORK + '/list3.txt'
    io.open(lst, 'w').write(''.join("file '%s'\n" % s for s in (s0, s1, s2)))
    pic = WORK + '/pic3.mp4'
    sh(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', pic])
    total = OPEN + d1 + CLOSE
    # voice: te (film time) -> global = te - T_IN + OPEN ; first and last lines pinned
    g = [0.35] + [x['t'] - T_IN + OPEN for x in S[1:-1]] + [OPEN + d1 + 0.25]
    R = 24000
    voice = np.zeros(int((total + 3) * R), np.float32)
    for i, st in enumerate(g):
        fn = '%s/voice/e/L%02d.wav' % (HERE, i)
        nxt = g[i + 1] if i + 1 < len(g) else total
        dur = wdur(fn)
        av = nxt - st - 0.15
        tmp = fn
        if dur > av and i + 1 < len(g):
            f = min(1.2, dur / av)
            tmp = '%s/vt_%d.wav' % (WORK, i)
            sh(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', fn, '-af', 'atempo=%.3f' % f, tmp])
            print('line', i, 'dur %.2f avail %.2f atempo %.2f' % (dur, av, f))
        with wave.open(tmp, 'rb') as w:
            s = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)
        k = int(.03 * R); s[:k] *= np.linspace(0, 1, k); s[-k:] *= np.linspace(1, 0, k)
        j = int(st * R); voice[j:j + len(s)] += s[:max(0, len(voice) - j)]
    vw = WORK + '/voice3.wav'
    with wave.open(vw, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
        w.writeframes(np.clip(voice[:int(total * R)], -32767, 32767).astype(np.int16).tobytes())

    def load(n):
        p = sh(['ffmpeg', '-v', 'error', '-i', '%s/%s.wav' % (SFX, n), '-f', 's16le', '-ac', '1', '-ar', str(R), '-']).stdout
        return np.frombuffer(p, np.int16).astype(np.float32)
    wh, di, ri = load('whoosh'), load('ding'), load('rise')
    sfx = np.zeros(int(total * R) + R, np.float32)
    for t, a, arr in ((OPEN - 0.2, .26, wh), (OPEN + d1 - 0.2, .26, wh), (25.0 - T_IN + OPEN - 0.5, .3, ri), (total - 3.2, .2, di)):
        j = max(0, int(t * R)); sfx[j:j + len(arr)] += a * arr[:max(0, len(sfx) - j)]
    sw = WORK + '/sfx3.wav'
    with wave.open(sw, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
        w.writeframes(np.clip(sfx[:int(total * R)], -32767, 32767).astype(np.int16).tobytes())
    fc = ('[1:a]aresample=44100,loudnorm=I=-16:TP=-1.5:LRA=11,asplit=2[v1][v2];'
          '[3:a]aresample=44100,aloop=loop=-1:size=2000000000,atrim=0:%.2f,volume=0.15,afade=t=in:d=1.5,afade=t=out:st=%.2f:d=2.5[m0];'
          '[m0][v1]sidechaincompress=threshold=0.02:ratio=8:attack=30:release=600[m];'
          '[2:a]aresample=44100[fx];'
          '[v2][m][fx]amix=inputs=3:normalize=0:duration=first,alimiter=limit=0.95[a]') % (total, total - 2.5)
    mixed = WORK + '/mixed3.mp4'
    sh(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', pic, '-i', vw, '-i', sw, '-i', MUSIC, '-filter_complex', fc,
        '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-ac', '2', '-t', '%.3f' % total, mixed])
    portrait = OUT + '/arachin-v3-portrait.mp4'
    sh(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', mixed, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:v', 'copy', '-c:a', 'aac',
        '-b:a', '192k', '-ar', '44100', '-movflags', '+faststart', portrait])
    land = OUT + '/arachin-v3-landscape.mp4'
    sh(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', portrait, '-filter_complex',
        '[0:v]split[a][b];[a]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=40:6,eq=brightness=-0.12[bg];[b]scale=-2:1080[fg];[bg][fg]overlay=(W-w)/2:0,format=yuv420p[v]',
        '-map', '[v]', '-map', '0:a', '-c:v', 'libx264', '-crf', '19', '-preset', 'veryfast', '-c:a', 'copy', '-movflags', '+faststart', land])
    print('->', portrait, land, '%.1f s' % total)


if __name__ == '__main__':
    main()
