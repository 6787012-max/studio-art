# -*- coding: utf-8 -*-
"""Supervisor tool for khs_98 (short98 "lo onesh matana", a gift and not a punishment), phase B.
Caption boxes are the film shots: 4 boxes = 4 film shots (a caption engine cut inside a box would blink).
The six storyboard ideas S1..S6 are beats inside those shots (see STORYBOARD.md).
Caption rows come from anim/short98/captions.json (CAP_01..CAP_12). In-scene labels LBL_A..LBL_H are read by
regex from work/short98_SUPERVISOR_FIXES.md (never typed here). Writes captions_vault.json, script_spec.json,
timeline.json. No Hebrew is typed here."""
import io, json, re
WORK = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/work'
ANIM = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/anim/short98'
HERE = 'C:/projects/_studio-animatzia/productions/khs_98'
CLIP = 18.40
TAIL = 1.0
DUR = round(CLIP + TAIL, 2)
# caption boxes (CAP_01..CAP_12 grouped 3 per box, as the supervisor fixed): box windows 0.00-3.82, 3.84-8.23, 8.25-12.43, 12.45-17.40
GROUPS = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]]
SHOT_OF_BOX = [0, 1, 2, 3]
SHOTS_ID = ['s01', 's02', 's03', 's04']

ROWS = json.load(io.open(ANIM + '/captions.json', encoding='utf-8'))
assert len(ROWS) == 12, len(ROWS)
ROW = {r['n']: r for r in ROWS}
assert sorted(sum(GROUPS, [])) == list(range(1, 13))

GR = []
for g in GROUPS:
    rows = [ROW[n] for n in g]
    GR.append({'s': round(rows[0]['t0'], 2), 'e': round(rows[-1]['t1'], 2),
               'text': ' '.join(r['text'] for r in rows), 'ids': ['CAP_%02d' % n for n in g]})

# shot starts = box starts; the last shot ends at the clip end (CLIP_DUR)
SHOT_T = [GR[0]['s']] + [g['s'] for g in GR[1:]] + [CLIP]
SHOT_T[0] = 0.0
CAPS = []
for k, g in enumerate(GR):
    CAPS.append({'shot': SHOT_OF_BOX[k], 'id': 'G_' + g['ids'][0], 'ws': SHOT_T[k], 'we': g['e'],
                 'text': g['text'], 'units': g['ids']})

FIX = io.open(WORK + '/short98_SUPERVISOR_FIXES.md', encoding='utf-8').read()
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

spec = {'production': 'khs_98', 'films': [{'id': 'film_a', 'title': '', 'kicker': '', 'recap': [], 'shots': spec_shots}]}
io.open(HERE + '/script_spec.json', 'w', encoding='utf-8').write(json.dumps(spec, ensure_ascii=False, indent=1))
tl = {'fps': 30, 'films': {'film_a': {'titleDur': 0, 'recapDur': 0, 'shots': shots_tl, 'audio': {'narration': None, 'music': None}}},
      'shots': shots_tl,
      'voice': {'source': 'real recording of the lecturer, mixed locally; NOT part of the render', 'clipDur': CLIP}}
io.open(HERE + '/timeline.json', 'w', encoding='utf-8').write(json.dumps(tl, ensure_ascii=False, indent=1))
for c in CAPS:
    print(c['id'], 'win', c['ws'], c['we'], 'len', round(c['we'] - c['ws'], 2), 'units', ','.join(c['units']))
print('shot starts', SHOT_T, 'labels', sorted(LBL), 'clip', CLIP, 'total', DUR)
