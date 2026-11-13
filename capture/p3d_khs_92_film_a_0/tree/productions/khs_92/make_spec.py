# -*- coding: utf-8 -*-
"""Supervisor tool for khs_92 (short92 "why is there time" - Ramchal, Daat Tevunot).
Builds script_spec.json from the approved caption file (work/short92_captions.txt: CAP_ID, start, end, text on the OUTPUT
timeline). Shots start at SHOT_START_CAP. Inside a shot, units are grouped into display windows of >= 4.4 s (text unchanged);
each window runs until the next group starts (or the shot ends). No Hebrew is typed in this file.
--timeline patches timeline.json with the real caption windows (same pattern as khs_91)."""
import io, json, sys
WORK = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/work'
HERE = 'C:/projects/_studio-animatzia/productions/khs_92'
CLIP = 28.03                    # spoken length (short92 phase A, R2 final)
TAIL = 1.0
DUR = round(CLIP + TAIL, 2)
# shot starts = first caption of each idea: K1a+K1b / K2 / K4 / K5 / K6 / K7
SHOT_START_CAP = ['CAP_01', 'CAP_04', 'CAP_11', 'CAP_16', 'CAP_17', 'CAP_21']
SHOTS_ID = ['s01', 's02', 's03', 's04', 's05', 's06']

CAPS_RAW = []   # (cap_id, start, end, text)
for line in io.open(WORK + '/short92_captions.txt', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) == 4:
        CAPS_RAW.append((p[0], float(p[1]), float(p[2]), p[3]))
IDX = {c[0]: i for i, c in enumerate(CAPS_RAW)}
starts = [IDX[c] for c in SHOT_START_CAP] + [len(CAPS_RAW)]
SHOT_T = [0.0] + [round(CAPS_RAW[IDX[c]][1], 2) for c in SHOT_START_CAP[1:]] + [DUR]

CAPS = []   # dict: shot, id, ws, we, text, units
for k in range(len(SHOTS_ID)):
    grp, cur = [], None
    for cid, s, e, txt in CAPS_RAW[starts[k]:starts[k + 1]]:
        if cur is None:
            cur = {'s': s, 'e': e, 't': [txt], 'ids': [cid]}
        else:
            cur['e'] = e; cur['t'].append(txt); cur['ids'].append(cid)
        if cur['e'] - cur['s'] >= 4.4:
            grp.append(cur); cur = None
    if cur is not None:
        if grp:
            grp[-1]['e'] = cur['e']; grp[-1]['t'] += cur['t']; grp[-1]['ids'] += cur['ids']
        else:
            grp.append(cur)
    for j, g in enumerate(grp):
        ws = SHOT_T[k] if j == 0 else round(g['s'], 2)
        we = round(grp[j + 1]['s'], 2) if j + 1 < len(grp) else SHOT_T[k + 1]
        CAPS.append({'shot': k, 'id': 'G_' + g['ids'][0], 'ws': ws, 'we': we, 'text': ' '.join(g['t']), 'units': g['ids']})

for c in CAPS:
    print(c['id'], 'win', c['ws'], c['we'], 'len', round(c['we'] - c['ws'], 2), 'shot', SHOTS_ID[c['shot']], 'units', ','.join(x[4:] for x in c['units']))
    if c['we'] - c['ws'] < 4.4:
        print('NOTE window < 4.4 s:', c['id'])
print('shot bounds', SHOT_T)

def caps_of_shot(k):
    return [c for c in CAPS if c['shot'] == k]

if '--timeline' not in sys.argv:
    shots = []
    for k, sid in enumerate(SHOTS_ID):
        shots.append({'id': sid, 'dur': round(SHOT_T[k + 1] - SHOT_T[k], 2),
                      'captions': [{'id': c['id'], 'text': c['text']} for c in caps_of_shot(k)]})
    spec = {'production': 'khs_92', 'films': [{'id': 'film_a', 'title': '', 'kicker': '', 'recap': [], 'shots': shots}]}
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
