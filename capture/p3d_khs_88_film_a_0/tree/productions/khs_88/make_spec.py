# -*- coding: utf-8 -*-
"""Supervisor tool for khs_88 (short88 "they will laugh" - thank Hashem for troubles, one picture, laughter).
Builds script_spec.json from the Phase-A caption list (short88_captions.txt: CAP_ID, start, end, text on the OUTPUT timeline).
Captions are grouped into display windows of >= 4.6 s (adjacent units, text unchanged), shots start on group boundaries.
No Hebrew is typed in this file; the text is read from the approved caption file.
--timeline patches timeline.json with the real caption windows (same pattern as khs_87)."""
import io, json, sys
WORK = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/work'
HERE = 'C:/projects/_studio-animatzia/productions/khs_88'
CLIP = 83.51                    # spoken length (Phase A)
TAIL = 0.8
DUR = round(CLIP + TAIL, 2)
SHOT_TARGET = [0.0, 11.0, 22.5, 39.0, 50.5, 61.5, 74.0]
SHOTS_ID = ['s01', 's02', 's03', 's04', 's05', 's06', 's07']

CAPS_RAW = []   # (cap_id, start, end, text)
for line in io.open(WORK + '/short88_captions.txt', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) == 4:
        CAPS_RAW.append((p[0], float(p[1]), float(p[2]), p[3]))

# greedy grouping: units accumulate until the window (first start -> next group start) is >= 4.6 s
GROUPS = []   # [start, end, [texts]]
cur = None
for cid, s, e, txt in CAPS_RAW:
    if cur is None:
        cur = {'s': s, 'e': e, 't': [txt]}
    else:
        cur['e'] = e; cur['t'].append(txt)
    if cur['e'] - cur['s'] >= 4.6:
        GROUPS.append(cur); cur = None
if cur is not None:
    if GROUPS:
        GROUPS[-1]['e'] = cur['e']; GROUPS[-1]['t'] += cur['t']
    else:
        GROUPS.append(cur)

# shot starts = group start nearest to each target
SHOT_START = []
for tgt in SHOT_TARGET:
    cand = [g['s'] for g in GROUPS if g['s'] >= (SHOT_START[-1] + 4.6 if SHOT_START else 0)]
    SHOT_START.append(min(cand, key=lambda s: abs(s - tgt)))
BOUNDS = [0.0] + SHOT_START[1:] + [DUR]

# caption display windows: group k lasts until group k+1 starts (within the same shot), last group of a shot ends at shot end
CAPS = []   # (id, win_start, win_end, text, shot_index)
n = 0
for k in range(len(SHOTS_ID)):
    a, b = BOUNDS[k], BOUNDS[k + 1]
    gs = [g for g in GROUPS if a <= g['s'] < b - 0.01]
    for j, g in enumerate(gs):
        n += 1
        ws = g['s']
        we = gs[j + 1]['s'] if j + 1 < len(gs) else b
        CAPS.append(('CAP_A_%02d' % n, round(ws, 2), round(we, 2), ' '.join(g['t']), k))

for cid, ws, we, txt, k in CAPS:
    print(cid, 'win', ws, we, 'len', round(we - ws, 2), 'shot', SHOTS_ID[k], 'words', len(txt.split()))
    if we - ws < 4.4 and cid != CAPS[-1][0]:
        print('WARNING window < 4.4 s:', cid)
print('shot bounds', BOUNDS)

def caps_of_shot(k):
    return [c for c in CAPS if c[4] == k]

if '--timeline' not in sys.argv:
    shots = []
    for k, sid in enumerate(SHOTS_ID):
        a, b = BOUNDS[k], BOUNDS[k + 1]
        shots.append({'id': sid, 'dur': round(b - a, 2),
                      'captions': [{'id': c[0], 'text': c[3]} for c in caps_of_shot(k)]})
    spec = {'production': 'khs_88', 'films': [{'id': 'film_a', 'title': '', 'kicker': '', 'recap': [], 'shots': shots}]}
    io.open(HERE + '/script_spec.json', 'w', encoding='utf-8').write(json.dumps(spec, ensure_ascii=False, indent=1))
    print('script_spec.json written; captions:', len(CAPS), 'total dur', DUR, 'clip', CLIP)
else:
    tl = json.load(io.open(HERE + '/timeline.json', encoding='utf-8'))
    films = tl.get('films', {})
    targets = [films['film_a']] if 'film_a' in films else []
    if 'shots' in tl:
        targets.append(tl)
    for f in targets:
        for k, sh in enumerate(f['shots']):
            a, b = BOUNDS[k], BOUNDS[k + 1]
            cs = caps_of_shot(k)
            sh['dur'] = round(b - a, 2)
            sh['capAt'] = [round(c[1] - a, 2) for c in cs]
            sh['capUntil'] = [round(c[2] - a, 2) for c in cs]
            for cc, c in zip(sh.get('captions', []), cs):
                cc['at'] = round(c[1] - a, 2); cc['until'] = round(c[2] - a, 2)
        f['titleDur'] = 0; f['recapDur'] = 0
    tl['voice'] = {'source': 'real recording of the lecturer, mixed locally; NOT part of the render', 'clipDur': CLIP}
    json.dump(tl, io.open(HERE + '/timeline.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('timeline.json patched (%d targets)' % len(targets))
