# -*- coding: utf-8 -*-
"""Supervisor tool for khs_100 (short100 "ein melech bela am", the last short of the series), phase B.
Caption boxes are the film shots: 10 boxes = 10 film shots (a caption engine cut inside a box would blink).
Box grouping is fixed by hand from the caption rows (3 lines max per box, never a row split).
Caption rows come from anim/short100/captions.json (26 rows). In-scene labels LBL_A..LBL_H are read by
regex from work/short100_SUPERVISOR_FIXES.md (never typed here). Writes captions_vault.json, script_spec.json,
timeline.json. No Hebrew is typed here."""
import io, json, re
WORK = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/work'
ANIM = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/anim/short100'
HERE = 'C:/projects/_studio-animatzia/productions/khs_100'
CLIP = 42.61          # = window.CLIP_DUR in words.js (last caption ends 41.61 + 1.0 tail)
TAIL = 1.0
DUR = round(CLIP + TAIL, 2)
# caption boxes (rows CAP_01..CAP_26 grouped by hand; 3 lines max per box; the last box runs to CLIP)
GROUPS = [[1, 2, 3], [4, 5, 6], [7], [8, 9, 10], [11, 12, 13], [14, 15, 16], [17, 18, 19], [20, 21, 22], [23, 24, 25], [26]]
SHOT_OF_BOX = list(range(len(GROUPS)))
SHOTS_ID = ['s%02d' % (k + 1) for k in range(len(GROUPS))]

ROWS = json.load(io.open(ANIM + '/captions.json', encoding='utf-8'))
assert len(ROWS) == 26, len(ROWS)
ROW = {r['n']: r for r in ROWS}
assert sorted(sum(GROUPS, [])) == list(range(1, 27))

GR = []
for k, g in enumerate(GROUPS):
    rows = [ROW[n] for n in g]
    e = CLIP if k == len(GROUPS) - 1 else round(rows[-1]['t1'], 2)
    GR.append({'e': e, 'text': ' '.join(r['text'] for r in rows), 'ids': ['CAP_%02d' % n for n in g]})

# shot k = [SHOT_T[k], SHOT_T[k+1]]; shot k starts where box k-1 ends; the last shot runs to CLIP
# the film shows each caption for (shot length - 0.3 s), so the short boxes need shot >= 3.1 s:
# box 17 gives 0.3 s to box 20 (box 20 = 3.14 s) and box 23 gives 0.07 s to box 26 (box 26 = 3.15 s)
GR[6]['e'] = 32.9
GR[8]['e'] = 39.46
SHOT_T = [0.0] + [g['e'] for g in GR[:-1]] + [CLIP]
CAPS = []
for k, g in enumerate(GR):
    CAPS.append({'shot': SHOT_OF_BOX[k], 'id': 'G_' + g['ids'][0], 'ws': SHOT_T[k], 'we': g['e'],
                 'text': g['text'], 'units': g['ids']})

FIX = io.open(WORK + '/short100_SUPERVISOR_FIXES.md', encoding='utf-8').read()
LBL = {}
for m in re.finditer(r'^(LBL_[A-H])\s+(\S.*?)\s*$', FIX, re.M):
    LBL[m.group(1)] = m.group(2)
assert len(LBL) == 8, sorted(LBL)

vault = {c['id']: c['text'] for c in CAPS}
for r in ROWS:
    vault['CAP_%02d' % r['n']] = r['text']
vault.update(LBL)
io.open(HERE + '/captions_vault.json', 'w', encoding='utf-8').write(json.dumps(vault, ensure_ascii=True, indent=1))

shots_tl = []
spec_shots = []
for k, sid in enumerate(SHOTS_ID):
    a, b = SHOT_T[k], SHOT_T[k + 1]
    cs = [c for c in CAPS if c['shot'] == k]
    shots_tl.append({'id': sid, 'brief': sid, 'dur': round(b - a, 2), 'briefDur': round(b - a, 2),
                     'captions': [{'id': c['id'], 'at': round(c['ws'] - a, 2), 'until': round(c['we'] - a, 2)} for c in cs],
                     'capAt': [round(c['ws'] - a, 2) for c in cs], 'words': []})
    spec_shots.append({'id': sid, 'dur': round(b - a, 2), 'captions': [{'id': c['id'], 'text': c['text']} for c in cs]})

spec = {'production': 'khs_100', 'films': [{'id': 'film_a', 'title': '', 'kicker': '', 'recap': [], 'shots': spec_shots}]}
io.open(HERE + '/script_spec.json', 'w', encoding='utf-8').write(json.dumps(spec, ensure_ascii=False, indent=1))
tl = {'fps': 30, 'films': {'film_a': {'titleDur': 0, 'recapDur': 0, 'shots': shots_tl, 'audio': {'narration': None, 'music': None}}},
      'shots': shots_tl,
      'voice': {'source': 'real recording of the lecturer, mixed locally; NOT part of the render', 'clipDur': CLIP}}
io.open(HERE + '/timeline.json', 'w', encoding='utf-8').write(json.dumps(tl, ensure_ascii=False, indent=1))
for c in CAPS:
    print(c['id'], 'win', c['ws'], c['we'], 'len', round(c['we'] - c['ws'], 2), 'units', ','.join(c['units']))
print('shot starts', SHOT_T, 'labels', sorted(LBL), 'clip', CLIP, 'total', DUR)
