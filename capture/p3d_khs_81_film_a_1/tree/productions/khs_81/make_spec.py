# -*- coding: utf-8 -*-
"""Supervisor tool (copied from kh_short60): builds script_spec.json for khs_81 from the VERIFIED word list of short81
(captions are cut from real word times, nothing Hebrew is typed here). Step 2 (--timeline) overwrites capAt in timeline.json
with the real voice times (prep_production spreads captions evenly without narration)."""
import io, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)).replace(os.sep, '/')
WJS = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/anim/short81/words.js'
src = io.open(WJS, encoding='utf-8').read()
WORDS = json.loads(re.search(r'WORDS = (\[.*?\]);', src, re.S).group(1))
CLIP = float(re.search(r'CLIP_DUR = ([\d.]+)', src).group(1))
TAIL = 0.8  # extra still time after the voice; compose_short trims the render to CLIP (0.8 so the last caption window >= 4.4 after the engine's dur-0.3 cut)

# caption windows [show_from, show_until) and the word-time range [w0, w1) whose words form the text
CAPS = [  # id, window start, window end, first-word-time >=, <
    ('CAP_A_01', 0.0, 4.9, 0.0, 4.9),
    ('CAP_A_02', 4.9, 9.7, 4.9, 9.7),
    ('CAP_A_03', 9.7, 14.5, 9.7, 14.3),
    ('CAP_A_04', 14.5, 19.3, 14.3, 18.4),
    ('CAP_A_05', 19.3, 24.9, 18.4, 24.9),
    ('CAP_A_06', 24.9, 30.4, 24.9, 30.4),
    ('CAP_A_07', 30.4, 35.2, 30.4, 35.0),
    ('CAP_A_08', 35.2, 41.4, 35.0, 41.4),
    ('CAP_A_09', 41.4, 46.0, 41.4, 46.0),
    ('CAP_A_10', 46.0, 52.6, 46.0, 52.6),
    ('CAP_A_11', 52.6, 57.6, 52.6, 57.6),
    ('CAP_A_12', 57.6, 62.0, 57.6, 61.7),
    ('CAP_A_13', 62.0, CLIP + TAIL, 61.7, 99),
]
SHOTS = [('s01', 0.0, 14.5, [0, 1, 2]), ('s02', 14.5, 30.4, [3, 4, 5]), ('s03', 30.4, 46.0, [6, 7, 8]),
         ('s04', 46.0, 57.6, [9, 10]), ('s05', 57.6, CLIP + TAIL, [11, 12])]

def text_of(w0, w1):
    return ' '.join(w['w'] for w in WORDS if w0 <= w['t'] < w1)


if '--timeline' not in sys.argv:
    shots = []
    for sid, a, b, ci in SHOTS:
        shots.append({'id': sid, 'dur': round(b - a, 2),
                      'captions': [{'id': CAPS[i][0], 'text': text_of(CAPS[i][3], CAPS[i][4])} for i in ci]})
    spec = {'production': 'khs_81', 'films': [{'id': 'film_a', 'title': '', 'kicker': '', 'recap': [], 'shots': shots}]}
    io.open(HERE + '/script_spec.json', 'w', encoding='utf-8').write(json.dumps(spec, ensure_ascii=False, indent=1))
    print('script_spec.json written;', len(CAPS), 'captions, total', round(CLIP + TAIL, 2), 's; words per caption:',
          [len(text_of(c[3], c[4]).split()) for c in CAPS])
else:
    tl = json.load(io.open(HERE + '/timeline.json', encoding='utf-8'))
    films = tl.get('films', {})
    targets = [films['film_a']] if 'film_a' in films else []
    if 'shots' in tl:
        targets.append(tl)  # patch BOTH (failure log 23/10)
    for f in targets:
        for sh, (sid, a, b, ci) in zip(f['shots'], SHOTS):
            sh['dur'] = round(b - a, 2)
            sh['capAt'] = [round(CAPS[i][1] - a, 2) for i in ci]
            sh['capUntil'] = [round(CAPS[i][2] - a, 2) for i in ci]
            for c, i in zip(sh.get('captions', []), ci):
                c['at'] = round(CAPS[i][1] - a, 2); c['until'] = round(CAPS[i][2] - a, 2)
        f['titleDur'] = 0; f['recapDur'] = 0
    tl['voice'] = {'source': 'real recording of the lecturer, mixed locally; NOT part of the render', 'clipDur': CLIP}
    json.dump(tl, io.open(HERE + '/timeline.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('timeline.json patched (%d targets): capAt from real voice times' % len(targets))
