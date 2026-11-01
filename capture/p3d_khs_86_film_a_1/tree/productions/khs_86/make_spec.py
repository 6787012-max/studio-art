# -*- coding: utf-8 -*-
"""Supervisor tool (copied from kh_short60): builds script_spec.json for khs_86 from the VERIFIED word list of short86
(captions are cut from real word times, nothing Hebrew is typed here). Step 2 (--timeline) overwrites capAt in timeline.json
with the real voice times (prep_production spreads captions evenly without narration)."""
import io, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)).replace(os.sep, '/')
WJS = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/anim/short86/words.js'
src = io.open(WJS, encoding='utf-8').read()
WORDS = json.loads(re.search(r'WORDS = (\[.*?\]);', src, re.S).group(1))
CLIP = float(re.search(r'CLIP_DUR = ([\d.]+)', src).group(1))
TAIL = 0.8  # extra still time after the voice; compose_short trims the render to CLIP (0.8 so the last caption window >= 4.4 after the engine's dur-0.3 cut)

# caption windows [show_from, show_until) and the word-time range [w0, w1) whose words form the text
CAPS = [  # id, window start, window end, first-word-time >=, <   (windows start 0.2 s before the first word of the chunk)
    ('CAP_A_01', 0.0, 6.37, 0.0, 5.99),
    ('CAP_A_02', 6.37, 11.35, 5.99, 11.01),
    ('CAP_A_03', 11.35, 16.87, 11.01, 16.57),
    ('CAP_A_04', 16.87, 21.97, 16.57, 21.85),
    ('CAP_A_05', 21.97, 26.56, 21.85, 26.49),
    ('CAP_A_06', 26.56, 31.66, 26.49, 31.42),
    ('CAP_A_07', 31.66, 36.56, 31.42, 36.45),
    ('CAP_A_08', 36.56, 43.16, 36.45, 42.91),
    ('CAP_A_09', 43.16, 48.42, 42.91, 48.14),
    ('CAP_A_10', 48.42, 54.26, 48.14, 53.87),
    ('CAP_A_11', 54.26, 59.78, 53.87, 59.68),
    ('CAP_A_12', 59.78, 64.55, 59.68, 64.42),
    ('CAP_A_13', 64.55, CLIP + TAIL, 64.42, 99),
]
SHOTS = [('s01', 0.0, 11.35, [0, 1]), ('s02', 11.35, 21.97, [2, 3]), ('s03', 21.97, 31.66, [4, 5]), ('s04', 31.66, 43.16, [6, 7]),
         ('s05', 43.16, 54.26, [8, 9]), ('s06', 54.26, 64.55, [10, 11]), ('s07', 64.55, CLIP + TAIL, [12])]

def text_of(w0, w1):
    return ' '.join(w['w'] for w in WORDS if w0 <= w['t'] < w1)


if '--timeline' not in sys.argv:
    shots = []
    for sid, a, b, ci in SHOTS:
        shots.append({'id': sid, 'dur': round(b - a, 2),
                      'captions': [{'id': CAPS[i][0], 'text': text_of(CAPS[i][3], CAPS[i][4])} for i in ci]})
    spec = {'production': 'khs_86', 'films': [{'id': 'film_a', 'title': '', 'kicker': '', 'recap': [], 'shots': shots}]}
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
