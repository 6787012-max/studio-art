# -*- coding: utf-8 -*-
"""מקודד מחדש את סרטי שיעור 6 לניגון חלק במצגת (יוסף 18/10: "שהווידאו יהיה בלי תקיעות"):
קצב נתונים מתון (עד 5 מגה לשנייה), תמונת מפתח כל 2 שניות, פרופיל שכל מחשב מנגן, faststart. עדיפות סרק.
    python productions/toldot06/smooth.py   (על כל lessons/06_3d/video3d/*.mp4, במקום)"""
import glob
import os
import subprocess

import psutil

psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
D = 'C:/projects/toldot-eretz-yisrael/v2/lessons/06_3d/video3d'
for f in sorted(glob.glob(os.path.join(D, '*.mp4'))):
    tmp = f[:-4] + '.smooth.mp4'
    r = subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', f, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
                        '-maxrate', '5M', '-bufsize', '10M', '-g', '60', '-keyint_min', '30', '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p',
                        '-threads', '4', '-c:a', 'copy', '-movflags', '+faststart', tmp])
    if r.returncode == 0 and os.path.getsize(tmp) > 1e6:
        a, b = os.path.getsize(f), os.path.getsize(tmp); os.replace(tmp, f)
        print('%s: %.0fMB -> %.0fMB' % (os.path.basename(f), a / 1048576, b / 1048576), flush=True)
    else:
        print('FAILED', f, r.returncode, flush=True)
