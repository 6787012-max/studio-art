# -*- coding: utf-8 -*-
# Measures loudnorm input_i of the chosen music track (prints numbers only).
import sys, os, subprocess, re
SHORTS = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools'
sys.path.insert(0, SHORTS)
import pipeline as P
track = 'D:/video-projects/_assets/music/mixkit_calm/10_250.mp3'
r = subprocess.run([P.FF, '-hide_banner', '-nostats', '-i', track, '-af',
                    'loudnorm=I=-17:TP=-4.3:LRA=6:print_format=summary', '-f', 'null', '-'],
                   capture_output=True, text=True, encoding='utf-8', errors='replace')
txt = r.stderr
m = re.search(r'Input Integrated:\s*(-?[\d.]+)\s*LUFS', txt)
print('track', os.path.basename(track), 'rc', r.returncode, 'input_i', m.group(1) if m else 'NOT FOUND')
if m:
    ii = float(m.group(1))
    print('music_vol', round(10 ** ((-27 - ii) / 20), 4))
