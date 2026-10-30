# -*- coding: utf-8 -*-
"""Local mix for siach 2026-10-29 (the voice never leaves this PC).
  python mix_final.py --video <silent render.mp4> [--ass-only]
Voice = days/2026-10-29/voice_track.wav delayed by OFF; music bed ducked under the voice; title + captions burned in."""
import sys, os, subprocess, argparse
sys.stdout.reconfigure(encoding="utf-8")
try:
    import psutil
    psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
except Exception:
    pass

DAY = "D:/video-projects/siach-meorer/daily/days/2026-10-29/"
VOICE = DAY + "voice_track.wav"
MUSIC = "D:/video-projects/_assets/music/04_calm/Morning.mp3"
OUT = "D:/video-projects/siach-meorer/out/שיח הבוקר - 2026-10-29.mp4"
ASS = "C:/projects/_studio-animatzia/productions/siach_20261029/caps.ass"
OFF, VOICE_LEN, TAIL = 3.5, 239.8, 4.0
TOTAL = OFF + VOICE_LEN + TAIL

TITLE = "מבט לאחור, מבט קדימה"
KICKER = "שיח הבוקר בבית המדרש · פרשת וירא תשפ״ז"
# (start, end, text) in film time; two captions per shot, kept short
CAPS = [
    (5.0, 11.5, "מטפסים במדרגות של בניין גבוה"),
    (11.5, 17.7, "סופרים כמה עברנו? או כמה נשאר?"),
    (18.3, 28.0, "לא להסתכל על הקומות"),
    (28.0, 37.7, "רק על המדרגה שאני עומד עליה עכשיו"),
    (38.3, 47.0, "\"אוי, נשארו עוד שמונה קומות...\""),
    (47.0, 56.3, "או: \"עברתי כבר שתיים, ברוך השם!\""),
    (56.9, 65.5, "ילדים קטנים בדרך לטיול"),
    (65.5, 73.7, "כמה זמן עבר? ומה שואלים?"),
    (74.3, 82.0, "\"מתי מגיעים?\" - אחרי עשר דקות"),
    (82.0, 89.7, "הקטן עוד לא מרגיש כמה דרך עברנו"),
    (90.3, 97.3, "להבין שעברנו דרך"),
    (97.3, 104.1, "זה חלק מלגדול"),
    (104.7, 113.5, "מגיעים למכינה אחרי החיידר"),
    (113.5, 121.7, "קושי בלימוד, קושי לקום בבוקר"),
    (122.3, 128.5, "עובר חודש, חצי שנה, שנה"),
    (128.5, 134.7, "ממשיכים לצעוד"),
    (135.3, 140.0, "מסתכלים אחורה: עברתי את זה!"),
    (140.0, 144.7, "ומי שעבר - יעבור גם עוד"),
    (145.3, 152.5, "אבל לפעמים לא טוב להביט אחורה"),
    (152.5, 159.7, "לבעל תשובה לא מזכירים את העבר"),
    (160.3, 168.5, "לשכוח, ולפתוח דף חדש"),
    (168.5, 176.3, "מתי מביטים אחורה, ומתי לא?"),
    (176.9, 185.5, "המלאך אומר ללוט: אל תביט אחורה"),
    (185.5, 193.7, "ה' הציל אותך - הבט קדימה"),
    (194.3, 203.0, "מי שהביט לאחור"),
    (203.0, 211.7, "נשאר נציב מלח"),
    (212.3, 219.8, "אנחנו לא רוצים להישאר מלוחים"),
    (219.8, 227.3, "רוצים להיות מתוקים - ולהביט קדימה"),
    (227.9, 235.5, "יש מקרים שכן, ויש מקרים שלא"),
    (235.5, 243.3, "לדעת מתי - זו העבודה שלנו בחיים"),
]
END_T, END_S = "מבט לאחור, מבט קדימה", "שבת שלום"

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
