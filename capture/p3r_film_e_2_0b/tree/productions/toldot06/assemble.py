# -*- coding: utf-8 -*-
"""מוסיף מוזיקה לסרטי התלת-ממד של שיעור 6 (רינדור שקט מהשרת) ומכין אותם למצגת.
    python productions/toldot06/assemble.py <film_id> [<film_id> ...]
קלט:  productions/toldot06/render/<film_id>/out.mp4
פלט:  C:/projects/toldot-eretz-yisrael/v2/lessons/06_3d/video3d/<film_id>.mp4 + _poster.png"""
import os
import subprocess
import sys

import psutil

psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = 'C:/projects/toldot-eretz-yisrael/v2/lessons/06_3d/video3d'
M = 'D:/video-projects/_assets/music/'
MUSIC = {   # אותן מנגינות כמו בשיעור 6 (music.json); הסרט החדש מקבל מנגינה משלו
    'a0_hook': (M + '01_uplifting/Fretless.mp3', .14),
    'film_b': (M + '01_uplifting/Carpe Diem.mp3', .13),
    'film_c': (M + '03_playful/Island Meet and Greet.mp3', .13),
    'film_d': (M + '01_uplifting/Gonna Start.mp3', .13),
    'film_e': (M + '01_uplifting/Nowhere Land.mp3', .13),
    'film_f': (M + '01_uplifting/Airship Serenity.mp3', .13),
    'film_z': (M + '01_uplifting/Still Pickin.mp3', .13),
}


def dur(f):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout.strip())


os.makedirs(OUT, exist_ok=True)
for fid in sys.argv[1:]:
    src = os.path.join(HERE, 'render', fid, 'out.mp4')
    music, vol = MUSIC[fid]
    if not os.path.exists(music):   # שם הקובץ במאגר יכול להיות בתיקייה אחרת
        name = os.path.basename(music)
        for root, _, fs in os.walk(M):
            if name in fs:
                music = os.path.join(root, name)
                break
    d = dur(src)
    out = os.path.join(OUT, fid + '.mp4')
    af = 'volume=%.3f,afade=t=in:d=1,afade=t=out:st=%.2f:d=2.5' % (vol, max(0, d - 2.6))
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-stream_loop', '-1', '-i', music,
                    '-filter_complex', '[1:a]' + af + '[a]', '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
                    '-t', '%.3f' % d, '-movflags', '+faststart', out], check=True)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', '5', '-i', out, '-frames:v', '1', '-vf', 'scale=1280:720',
                    os.path.join(OUT, fid + '_poster.png')], check=True)
    print('%s: %.1fs -> %s (%.0f MB)' % (fid, d, out, os.path.getsize(out) / 1e6))
