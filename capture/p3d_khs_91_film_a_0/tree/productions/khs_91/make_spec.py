# -*- coding: utf-8 -*-
"""Supervisor tool for khs_91 (short91 "only one who has questions enters the shiur" - Rashi on the angels and Israel).
Builds script_spec.json from the approved caption list (short91_captions.txt: CAP_ID, start, end, text on the OUTPUT timeline).
Shots are cut at the storyboard caption IDs (SHOT_START_CAP). Inside each shot, captions are grouped into display windows of >= 4.6 s
(adjacent units, text unchanged). No Hebrew is typed in this file; the text is read from the approved caption file.
--timeline patches timeline.json with the real caption windows (same pattern as khs_89)."""
import io, json, sys
WORK = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/work'
HERE = 'C:/projects/_studio-animatzia/productions/khs_91'
CLIP = 62.52                    # spoken length (short91 phase A)
TAIL = 1.0
DUR = round(CLIP + TAIL, 2)
# storyboard shot starts (idea boundaries): 0 / answer 11.5 / gilui-klali+who enters 20.4 / angel-messenger 27.0 / understand+Israel inside 36.4 / curious 46.5 / apathetic 58.3
SHOT_START_CAP = ['CAP_01', 'CAP_07', 'CAP_11', 'CAP_17', 'CAP_18', 'CAP_21', 'CAP_24', 'CAP_29', 'CAP_31', 'CAP_35']
SHOTS_ID = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10']

CAPS_RAW = []   # (cap_id, start, end, text)
for line in io.open(WORK + '/short91_captions.txt', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) == 4:
        CAPS_RAW.append((p[0], float(p[1]), float(p[2]), p[3]))
IDX = {c[0]: i for i, c in enumerate(CAPS_RAW)}

# global display groups (>= 4.6 s, adjacent units, text unchanged); shot cuts = group starts nearest the storyboard caption IDs
GROUPS = []
cur = None
for cid, s, e, txt in CAPS_RAW:
    if cur is None:
        cur = {'s': s, 'e': e, 't': [txt], 'ids': [cid]}
    else:
        cur['e'] = e; cur['t'].append(txt); cur['ids'].append(cid)
    if cur['e'] - cur['s'] >= 4.6:
        GROUPS.append(cur); cur = None
if cur is not None:
    if GROUPS:
        GROUPS[-1]['e'] = cur['e']; GROUPS[-1]['t'] += cur['t']; GROUPS[-1]['ids'] += cur['ids']
    else:
        GROUPS.append(cur)
BOUNDS = [0.0]
for capid in SHOT_START_CAP[1:]:
    tgt = CAPS_RAW[IDX[capid]][1]
    cand = [g['s'] for g in GROUPS if g['s'] >= BOUNDS[-1] + 1.0] or [DUR - 1.0]
    BOUNDS.append(min(cand, key=lambda s: abs(s - tgt)))
BOUNDS.append(DUR)
CAPS = []   # (id, win_start, win_end, text, shot_index, units)
for j, g in enumerate(GROUPS):
    k = max(i for i in range(len(SHOTS_ID)) if BOUNDS[i] <= g['s'] + 1e-6)
    ws = g['s']
    we = GROUPS[j + 1]['s'] if j + 1 < len(GROUPS) else DUR
    CAPS.append(('G_' + g['ids'][0], round(ws, 2), round(we, 2), ' '.join(g['t']), k, g['ids']))

for cid, ws, we, txt, k, ids in CAPS:
    print(cid, 'win', ws, we, 'len', round(we - ws, 2), 'shot', SHOTS_ID[k], 'units', ','.join(x[4:] for x in ids))
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
    spec = {'production': 'khs_91', 'films': [{'id': 'film_a', 'title': '', 'kicker': '', 'recap': [], 'shots': shots}]}
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
