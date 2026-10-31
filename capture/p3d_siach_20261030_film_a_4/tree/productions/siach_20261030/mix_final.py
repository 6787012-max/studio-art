# -*- coding: utf-8 -*-
"""Local mix for siach 2026-10-30 (the voice never leaves this PC).
  python mix_final.py --video <silent render.mp4> [--ass-only]
Voice = days/2026-10-30/voice_track.wav delayed by OFF; music bed ducked under the voice; title + captions burned in."""
import sys, os, subprocess, argparse
sys.stdout.reconfigure(encoding="utf-8")
try:
    import psutil
    psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
except Exception:
    pass

DAY = "D:/video-projects/siach-meorer/daily/days/2026-10-30/"
VOICE = DAY + "voice_track.wav"
MUSIC = "D:/video-projects/_assets/music/04_calm/Evening.mp3"
OUT = "D:/video-projects/siach-meorer/out/שיח הבוקר - 2026-10-30.mp4"
ASS = "C:/projects/_studio-animatzia/productions/siach_20261030/caps.ass"
OFF, VOICE_LEN, TAIL = 3.5, 239.0, 4.0
TOTAL = OFF + VOICE_LEN + TAIL

TITLE = "תקופת הזריעה"
KICKER = "שיח הבוקר בבית המדרש · פרשת וירא תשפ״ז"
# (start, end, text) in film time; two captions per shot, kept short
CAPS = [
    (4.0, 11.0, "בתקופה הזאת החקלאים זורעים"),
    (11.0, 17.7, "חורשים את השדה וטומנים זרעים"),
    (18.3, 26.5, "יש זרעים שצריכים מעט מים"),
    (26.5, 34.7, "ויש שצריכים השקעה גדולה"),
    (35.3, 43.5, "כתוב: בתקופה הזאת"),
    (43.5, 51.7, "כל בחור, כל אדם - בתקופת זריעה"),
    (52.3, 61.0, "לקבל על עצמך משהו קטן"),
    (61.0, 69.7, "להגיע בזמן, לחזור, להתפלל כראוי"),
    (70.3, 78.0, "משקים, וזה גדל"),
    (78.0, 85.5, "עוברים חודשים - ואומרים: גדלתי"),
    (86.1, 93.0, "משקים ומשקים - וזה לא גדל"),
    (93.0, 99.7, "לא רואים כלום, רק אדמה"),
    (100.3, 107.5, "ואז, אחרי חצי שנה - פתאום"),
    (107.5, 114.7, "זה גדל מהר מאוד מאוד"),
    (115.3, 123.0, "מה קרה כל הזמן הזה?"),
    (123.0, 131.2, "השורשים העמיקו, עוד ועוד"),
    (131.8, 140.0, "ומה זה הגשם אצלנו?"),
    (140.0, 148.7, "החקלאים נושאים עיניים לשמיים"),
    (149.3, 158.0, "החקלאי הוא שותף - הוא משקה"),
    (158.0, 166.5, "אבל בלי עזרת ה' - אי אפשר"),
    (167.1, 174.5, "שאלתי בחור שלמד איתי שנתיים"),
    (174.5, 181.7, "\"מה הסוד שלך?\""),
    (182.3, 190.5, "\"קודם כול - התפללתי על זה\""),
    (190.5, 198.7, "\"כל יום, יום-יום\""),
    (199.3, 206.0, "\"תעזור לי שיהיה לי שכל\""),
    (206.0, 212.3, "והקב\"ה פותח את השכל"),
    (212.9, 220.5, "כולנו זורעים, כל מיני זרעים"),
    (220.5, 228.1, "יש שרואים פירות מוקדם, ויש מאוחר"),
    (228.7, 235.5, "לא להתייאש"),
    (235.5, 242.3, "להאמין בה' ולחכות לשפע"),
]
END_T, END_S = "תקופת הזריעה", "שבת שלום"

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
