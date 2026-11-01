# -*- coding: utf-8 -*-
"""Local mix for siach 2026-10-28 (the voice never leaves this PC).
  python mix_final.py --video <silent render.mp4> [--ass-only]
Voice = days/2026-10-28/voice_track.wav delayed by OFF; music bed ducked under the voice; title + captions burned in."""
import sys, os, subprocess, argparse
sys.stdout.reconfigure(encoding="utf-8")
try:
    import psutil
    psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
except Exception:
    pass

DAY = "D:/video-projects/siach-meorer/daily/days/2026-10-28/"
VOICE = DAY + "voice_track.wav"
MUSIC = "D:/video-projects/_assets/music/06_solemn/Journey To Ascend.mp3"
OUT = "D:/video-projects/siach-meorer/out/שיח הבוקר - 2026-10-28.mp4"
ASS = "C:/projects/_studio-animatzia/productions/siach_20261028/caps.ass"
OFF, VOICE_LEN, TAIL = 3.5, 233.4, 4.0
TOTAL = OFF + VOICE_LEN + TAIL

TITLE = "העקדה"
KICKER = "שיח הבוקר בבית המדרש · פרשת וירא תשפ״ז"
# (start, end, text) in film time
CAPS = [
    (4.0, 17.5, "האב והבן הולכים יחד בדרך"),
    (17.5, 31.4, "\"לאן הולכים?\" - \"להקריב קרבן\""),
    (32.2, 45.0, "יצחק לא היה ילד - בן שלושים ושבע"),
    (45.0, 58.0, "\"אבא, איפה השה?\""),
    (58.0, 71.9, "והם ממשיכים ללכת, שניהם יחד"),
    (72.7, 85.0, "\"כבר קיבלתי את ציווי ה'\""),
    (85.0, 98.0, "\"תקשור אותי היטב, יד ורגל\""),
    (98.0, 110.6, "\"אני עושה את זה בלב שלם\""),
    (111.4, 122.0, "המלאכים בוכים"),
    (122.0, 132.0, "רגע כזה לא היה מאז בריאת העולם"),
    (132.8, 147.0, "\"אל תשלח ידך אל הנער\""),
    (147.0, 157.0, "\"לפחות משהו קטן...\""),
    (157.0, 167.3, "\"אל תעש לו מאומה\""),
    (168.0, 180.0, "יצחק - גיבור של כיבוד הורים"),
    (180.0, 191.5, "מוכן למסור את חייו בשביל אביו"),
    (192.2, 200.5, "בחורים - תבינו את זה כשתהיו הורים"),
    (201.2, 212.0, "לעקוד את עצמך, גם נגד ההיגיון"),
    (212.0, 224.0, "בדברים הקטנים, בבית"),
    (224.0, 236.6, "זו ההזדמנות שלנו - ושיהיה לטובה"),
]
END_T, END_S = "גבורתו של יצחק", "כיבוד הורים"

ap = argparse.ArgumentParser()
ap.add_argument("--video")
ap.add_argument("--ass-only", action="store_true")
a = ap.parse_args()


def ts(s):
    s = max(0, s); h = int(s // 3600); m = int(s % 3600 // 60); return "%d:%02d:%05.2f" % (h, m, s % 60)


ev = ["Dialogue: 0,%s,%s,Cap,,0,0,0,,{\\fad(250,250)}%s" % (ts(t0), ts(t1), t) for t0, t1, t in CAPS]
ev.append("Dialogue: 1,%s,%s,Title,,0,0,0,,{\\fad(400,400)}%s" % (ts(0.15), ts(OFF + 1.2), TITLE))
ev.append("Dialogue: 1,%s,%s,Sub,,0,0,0,,{\\fad(500,400)}%s" % (ts(0.5), ts(OFF + 1.2), KICKER))
ev.append("Dialogue: 1,%s,%s,Title,,0,0,0,,{\\fad(500,300)}%s" % (ts(OFF + VOICE_LEN + 0.2), ts(TOTAL), END_T))
ev.append("Dialogue: 1,%s,%s,Sub,,0,0,0,,{\\fad(700,300)}%s" % (ts(OFF + VOICE_LEN + 0.6), ts(TOTAL), END_S))
hdr = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Assistant ExtraBold,66,&H00FFFFFF,&H00FFFFFF,&H00301A10,&H96000000,0,0,0,0,100,100,0,0,1,4.5,2,2,120,120,70,177
Style: Title,Assistant ExtraBold,120,&H00A0E8FF,&H00FFFFFF,&H00301A10,&H96000000,0,0,0,0,100,100,0,0,1,7,3,8,100,100,90,177
Style: Sub,Assistant ExtraBold,66,&H00FFFFFF,&H00FFFFFF,&H00301A10,&H96000000,0,0,0,0,100,100,0,0,1,5,2,8,100,100,240,177

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
open(ASS, "w", encoding="utf-8-sig").write(hdr + "\n".join(ev) + "\n")
print("captions", len(CAPS), "->", ASS)
if a.ass_only:
    sys.exit(0)

mv, mhi = 0.12, 0.5
env = "if(lt(t,%.3f),%s,if(gt(t,%.3f),%s,%s))" % (OFF - 0.6, mhi, OFF + VOICE_LEN - 0.3, mhi, mv)
ass_esc = ASS.replace(":", "\\:")
filt = ("[0:a]aresample=48000,highpass=f=80,acompressor=threshold=-24dB:ratio=3,loudnorm=I=-16:TP=-2:LRA=7,"
        "adelay=%d|%d,apad=whole_dur=%.3f[n];"
        "[1:a]atrim=0:%.3f,volume='%s':eval=frame,afade=t=in:st=0:d=1.2,afade=t=out:st=%.3f:d=2,aresample=48000[m];"
        "[n][m]amix=inputs=2:duration=first:normalize=0[a];"
        "[2:v]tpad=stop_mode=clone:stop_duration=3,ass='%s':fontsdir='C\\:/Windows/Fonts'[v]") % (
    int(OFF * 1000), int(OFF * 1000), TOTAL, TOTAL, env, TOTAL - 2, ass_esc)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", VOICE, "-stream_loop", "-1", "-i", MUSIC, "-i", a.video,
                "-filter_complex", filt, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "21",
                "-pix_fmt", "yuv420p", "-threads", "4", "-c:a", "aac", "-b:a", "160k", "-t", "%.3f" % TOTAL,
                "-movflags", "+faststart", OUT], check=True)
d = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", OUT]).decode().strip()
print("done:", OUT, d)
