# -*- coding: utf-8 -*-
"""Arachin v3 narration: Gemini Live, voice Charon, FREE key only (gemini_side.free_key), one Live turn per line, checked by whisper ASR.
    python narrate_v3.py gen a b c      -> voice/<film>/L##.wav + report.json (cached, re-run safe)
Script (Hebrew, niqqud) lives in ../_caps_arachin_v3/script.json. Engine: productions/toldot08_3d/live_narrate.py (same as lesson 9)."""
import asyncio, difflib, io, json, os, re, sys, wave
sys.path.insert(0, 'C:/projects/_studio-animatzia/productions/toldot08_3d')
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import numpy as np  # noqa: F401
import live_narrate as L
from google import genai
import gemini_side

HERE = os.path.dirname(os.path.abspath(__file__)).replace('\\', '/')
V = HERE + '/voice'
S = json.load(io.open(HERE + '/../_caps_arachin_v3/script.json', encoding='utf-8'))

L.NIQ.update({'ערכין': 'עֲרָכִין', 'בכורות': 'בְּכוֹרוֹת'})
L.MOOD.update({'e': 'הסרטון הוא הזמנה שקטה וחמה של בוקר מוקדם: חושך, חלון מואר אחד, ואז זריחה והזמנה להצטרף לשיעור הדף היומי.',
    'a': 'הסרטון הוא קריאה מעוררת השראה: שאלה גדולה, ואז תשובה חמה ובטוחה שכל אדם שווה ערך, ובסוף הזמנה לבוא ללמוד.',
    'b': 'הסרטון הוא מסע קצר ומעורר השראה: צעד אחר צעד עד הפסגה, ובסוף הזמנה חמה להצטרף.',
    'c': 'הסרטון הוא הזמנה חמה ומעוררת השראה: מהמהירות של העיר אל רגע של לימוד משותף, ובסוף שאלה שמניעה לפעולה.',
})
L.BASE = ('אתה מגיד שיעור חם ואהוב שמזמין מבוגרים להצטרף לשיעור יומי בגמרא. דבר בעברית תקנית וברורה, בקול גברי נעים, '
          'כמו שיחה אישית ולא כמו הקראה, בקצב שופע וטבעי, לא איטי, ברצף וללא השתהות בתחילת המשפט ובסופו. '
          'הטקסט מנוקד: קרא לפי הניקוד. העלה את הטון בשאלות באופן טבעי. האינטונציה משתנה עם התוכן, אבל הקול עצמו נשאר אותו קול. '
          'קרא בדיוק את הטקסט שתקבל, מילה במילה, בלי להוסיף ובלי להשמיט ובלי הקדמה, ועצור רק בסוף המשפט.')
CTX = {'prev': ''}


def _direction(i, n, t):
    if i == 0:
        d = 'זו הפתיחה של הסרטון: פתח בעוצמה חמה ומסקרנת, כדי לתפוס את האוזן מהמילה הראשונה. '
    elif i == n - 1:
        d = 'זו השורה האחרונה: אמור אותה בחום ובביטחון, כהזמנה אישית, וסיים בנחת. '
    elif '?' in t:
        d = 'זו שאלה אמיתית: בסקרנות, עלייה טבעית בסוף. '
    else:
        d = 'המשך בקצב זורם וחי, בחום. '
    if CTX['prev']:
        d += 'המשפט הקודם שנאמר היה: "%s". המשך באותו קול ובאותו קצב. ' % CTX['prev'][:140]
    return d


L.direction = _direction


def plain(t):
    return re.sub(r'[\u0591-\u05c7]', '', t)


async def gen(film):
    for k in ('GOOGLE_API_KEY', 'GEMINI_API_KEY'):
        os.environ.pop(k, None)
    client = genai.Client(api_key=gemini_side.free_key(), http_options={'api_version': 'v1beta'})
    d = '%s/%s' % (V, film); os.makedirs(d, exist_ok=True)
    rep_f = d + '/report.json'
    rep = json.load(io.open(rep_f, encoding='utf-8')) if os.path.exists(rep_f) else {}
    ls = S[film]; n = len(ls); CTX['prev'] = ''
    for i, it in enumerate(ls):
        text = it['text']
        f = '%s/L%02d.wav' % (d, i)
        if os.path.exists(f):
            CTX['prev'] = plain(text); continue
        best = None
        for attempt in range(4):
            try:
                pcm, said = await L.speak(client, film, i, n, text)
            except Exception as e:
                print('%s L%02d err %s' % (film, i, str(e)[:120]), flush=True); await asyncio.sleep(10); continue
            pcm = L.trim(pcm)
            said = L.asr(pcm)
            w = [x for x in L.norm(text) if not x.isdigit()]; sd = [x for x in L.norm(said) if not x.isdigit()]
            sim = difflib.SequenceMatcher(None, w, sd).ratio()
            sec = len(pcm) / (2 * L.RATE)
            dbl = any(sd[k] == sd[k + 1] and len(sd[k]) > 2 for k in range(len(sd) - 1)) and not any(w[k] == w[k + 1] for k in range(len(w) - 1))
            cps = len(''.join(L.norm(text))) / max(sec, .1)
            ok = sim >= 0.75 and not dbl and 4.5 <= cps <= 18
            if not ok and attempt >= 1 and sim >= 0.55 and not dbl and 4.5 <= cps <= 18:
                ok = True
            if not best or (ok, sim) > (best[0], best[1]):
                best = (ok, sim, pcm, said)
            print('  %s L%02d try%d sim=%.2f %.1fs cps=%.1f %s' % (film, i, attempt, sim, sec, cps, 'OK' if ok else 'retry'), flush=True)
            if ok:
                break
            await asyncio.sleep(2)
        if not best:
            print('%s L%02d FAILED' % (film, i), flush=True); continue
        ok, sim, pcm, said = best
        with wave.open(f, 'wb') as w_:
            w_.setnchannels(1); w_.setsampwidth(2); w_.setframerate(L.RATE); w_.writeframes(pcm)
        rep[str(i)] = {'seg': it['seg'], 'sim': round(sim, 2), 'sec': round(len(pcm) / (2 * L.RATE), 2), 'ok': ok}
        json.dump(rep, io.open(rep_f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        CTX['prev'] = plain(text)
        await asyncio.sleep(1)


if __name__ == '__main__':
    try:
        import psutil
        psutil.Process().nice(psutil.IDLE_PRIORITY_CLASS)
    except Exception:
        pass
    if sys.argv[1] == 'gen':
        for f in sys.argv[2:]:
            asyncio.run(gen(f))
