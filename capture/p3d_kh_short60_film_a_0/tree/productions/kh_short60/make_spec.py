# -*- coding: utf-8 -*-
"""Supervisor tool: builds script_spec.json for the pilot short from the VERIFIED word list of short60
(captions are cut from real word times, nothing Hebrew is typed here). Step 2 (--timeline) overwrites capAt in timeline.json
with the real voice times (prep_production spreads captions evenly without narration)."""
import io, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)).replace(os.sep, '/')
WJS = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/anim/short60/words.js'
src = io.open(WJS, encoding='utf-8').read()
WORDS = json.loads(re.search(r'WORDS = (\[.*?\]);', src, re.S).group(1))
CLIP = float(re.search(r'CLIP_DUR = ([\d.]+)', src).group(1))

# caption windows [show_from, show_until) and the word-time range [w0, w1) whose words form the text
CAPS = [  # id, window start, window end, first-word-time >=, <
    ('CAP_A_01', 0.0, 8.7, 0.0, 8.7),
    ('CAP_A_02', 8.7, 14.2, 8.7, 14.2),
    ('CAP_A_03', 14.2, 19.2, 14.2, 19.4),
    ('CAP_A_04', 19.2, 25.0, 19.4, 25.3),
    ('CAP_A_05', 25.0, 29.5, 25.3, 29.5),
    ('CAP_A_06', 29.5, 36.2, 29.5, 36.2),
    ('CAP_A_07', 36.2, CLIP, 36.2, 99),
]
SHOTS = [('s01', 0.0, 8.7, [0]), ('s02', 8.7, 19.2, [1, 2]), ('s03', 19.2, 29.5, [3, 4]), ('s04', 29.5, CLIP, [5, 6])]


def text_of(w0, w1):
    return ' '.join(w['w'] for w in WORDS if w0 <= w['t'] < w1)


if '--timeline' not in sys.argv:
    shots = []
    for sid, a, b, ci in SHOTS:
        shots.append({'id': sid, 'dur': round(b - a, 2),
                      'captions': [{'id': CAPS[i][0], 'text': text_of(CAPS[i][3], CAPS[i][4])} for i in ci]})
    spec = {'production': 'kh_short60', 'films': [{'id': 'film_a', 'title': text_of(29.5, 31.4), 'kicker': '', 'recap': [], 'shots': shots}]}
    io.open(HERE + '/script_spec.json', 'w', encoding='utf-8').write(json.dumps(spec, ensure_ascii=False, indent=1))
    print('script_spec.json written;', len(CAPS), 'captions, total', round(CLIP, 2), 's')
else:
    tl = json.load(io.open(HERE + '/timeline.json', encoding='utf-8'))
    films = tl.get('films', {})
    f = films.get('film_a') or tl
    for sh, (sid, a, b, ci) in zip(f['shots'], SHOTS):
        sh['dur'] = round(b - a, 2)
        sh['capAt'] = [round(CAPS[i][1] - a, 2) for i in ci]
        sh['capUntil'] = [round(CAPS[i][2] - a, 2) for i in ci]
        for c, i in zip(sh.get('captions', []), ci):
            c['at'] = round(CAPS[i][1] - a, 2); c['until'] = round(CAPS[i][2] - a, 2)
    f['titleDur'] = 0; f['recapDur'] = 0
    tl['voice'] = {'source': 'real recording of the lecturer, mixed locally; NOT part of the render', 'clipDur': CLIP}
    json.dump(tl, io.open(HERE + '/timeline.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('timeline.json patched: capAt from real voice times')
