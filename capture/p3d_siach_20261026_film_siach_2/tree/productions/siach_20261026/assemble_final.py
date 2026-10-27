"""Mix the rendered 3D film with the real talk audio (voice_track.wav) and a soft music bed.
Runs locally (our audio never goes to the public render repo).
usage: python assemble_final.py <rendered.mp4>"""
import os, sys, subprocess
try:
    import psutil; psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
except Exception:
    pass

DAY = 'D:/video-projects/siach-meorer/daily/days/2026-10-26'
VOICE = DAY + '/voice_track.wav'
MUSIC = 'D:/video-projects/_assets/music/04_calm/Morning.mp3'
OUT = 'D:/video-projects/siach-meorer/out/שיח הבוקר - 2026-10-26.mp4'
film = sys.argv[1]
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', film]).decode().strip())
fade = max(dur - 4, 0)
fc = ('[1:a]aresample=48000,highpass=f=80,acompressor=threshold=-24dB:ratio=3,volume=1.6[v];'
      '[2:a]aresample=48000,volume=0.12,afade=t=out:st=%.2f:d=4[m];'
      '[v][m]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11[aa]') % fade
cmd = ['ffmpeg', '-v', 'error', '-y', '-i', film, '-i', VOICE, '-stream_loop', '-1', '-i', MUSIC,
       '-filter_complex', fc, '-map', '0:v', '-map', '[aa]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
       '-t', '%.2f' % dur, '-movflags', '+faststart', OUT]
os.makedirs(os.path.dirname(OUT), exist_ok=True)
r = subprocess.run(cmd)
print('assemble exit', r.returncode, 'dur', dur, 'out', OUT)
