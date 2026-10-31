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
