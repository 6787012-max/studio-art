# -*- coding: utf-8 -*-
"""Supervisor tool for khs_93 (short93 "kaftorim bashamayim"), fix round 1.
Caption groups are EXPLICIT (CAP numbers from work/short93_captions.txt, text unchanged, order unchanged).
Shots start at group starts; a shot may hold several groups. Writes script_spec.json; --timeline patches timeline.json.
No Hebrew is typed in this file."""
import io, json, sys
WORK = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/work'
HERE = 'C:/projects/_studio-animatzia/productions/khs_93'
CLIP = 38.98
TAIL = 1.0
DUR = round(CLIP + TAIL, 2)
GROUPS = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17], [18, 19], [20, 21, 22], [23, 24, 25], [26, 27, 28]]
SHOT_START_CAP = ['CAP_01', 'CAP_04', 'CAP_07', 'CAP_10', 'CAP_15', 'CAP_18', 'CAP_20', 'CAP_23', 'CAP_26']
SHOTS_ID = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09']

CAPS_RAW = []   # (cap_id, start, end, text)
for line in io.open(WORK + '/short93_captions.txt', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) == 4:
        CAPS_RAW.append((p[0], float(p[1]), float(p[2]), p[3]))
ROW = {c[0]: c for c in CAPS_RAW}
SHOT_T = [0.0] + [round(ROW[c][1], 2) for c in SHOT_START_CAP[1:]] + [DUR]

GR = []
for g in GROUPS:
    rows = [ROW['CAP_%02d' % n] for n in g]
    GR.append({'s': round(rows[0][1], 2), 'e': round(rows[-1][2], 2), 'text': ' '.join(r[3] for r in rows), 'ids': ['CAP_%02d' % n for n in g]})

CAPS = []
for k in range(len(SHOTS_ID)):
    gs = [g for g in GR if SHOT_T[k] - 1e-6 <= g['s'] < SHOT_T[k + 1] - 1e-6]
    for j, g in enumerate(gs):
        ws = SHOT_T[k] if j == 0 else g['s']
        we = gs[j + 1]['s'] if j + 1 < len(gs) else (DUR - 0.3 if k == len(SHOTS_ID) - 1 else SHOT_T[k + 1])
        CAPS.append({'shot': k, 'id': 'G_' + g['ids'][0], 'ws': round(ws, 2), 'we': round(we, 2), 'text': g['text'], 'units': g['ids']})

for c in CAPS:
    print(c['id'], 'win', c['ws'], c['we'], 'len', round(c['we'] - c['ws'], 2), 'shot', SHOTS_ID[c['shot']], 'units', ','.join(x[4:] for x in c['units']), 'words', len(c['text'].split()))
print('shot bounds', SHOT_T)

def caps_of_shot(k):
    return [c for c in CAPS if c['shot'] == k]

if '--timeline' not in sys.argv:
    shots = []
    for k, sid in enumerate(SHOTS_ID):
        shots.append({'id': sid, 'dur': round(SHOT_T[k + 1] - SHOT_T[k], 2),
                      'captions': [{'id': c['id'], 'text': c['text']} for c in caps_of_shot(k)]})
    spec = {'production': 'khs_93', 'films': [{'id': 'film_a', 'title': '', 'kicker': '', 'recap': [], 'shots': shots}]}
    io.open(HERE + '/script_spec.json', 'w', encoding='utf-8').write(json.dumps(spec, ensure_ascii=False, indent=1))
    print('script_spec.json written; caption groups:', len(CAPS), 'total dur', DUR, 'clip', CLIP)
else:
    tl = json.load(io.open(HERE + '/timeline.json', encoding='utf-8'))
    films = tl.get('films', {})
    targets = [films['film_a']] if 'film_a' in films else []
    if 'shots' in tl:
        targets.append(tl)
    for f in targets:
        for k, sh in enumerate(f['shots']):
            a, b = SHOT_T[k], SHOT_T[k + 1]
            cs = caps_of_shot(k)
            sh['dur'] = round(b - a, 2)
            sh['capAt'] = [round(c['ws'] - a, 2) for c in cs] + [round(b - a, 2)]
            sh['capUntil'] = [round(c['we'] - a, 2) for c in cs]
            for cc, c in zip(sh.get('captions', []), cs):
                cc['at'] = round(c['ws'] - a, 2); cc['until'] = round(c['we'] - a, 2)
        f['titleDur'] = 0; f['recapDur'] = 0
    tl['voice'] = {'source': 'real recording of the lecturer, mixed locally; NOT part of the render', 'clipDur': CLIP}
    json.dump(tl, io.open(HERE + '/timeline.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('timeline.json patched (%d targets)' % len(targets))
