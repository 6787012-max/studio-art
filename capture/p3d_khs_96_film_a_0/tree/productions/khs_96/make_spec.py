# -*- coding: utf-8 -*-
"""Supervisor tool for khs_96 (short96 "kelev bechagora", the leashed dog), phase B.
8 caption boxes (grouped by caption IDs) = 8 shots; one box inside one shot.
Caption rows: anim/short96/captions.json (n, t0, t1, text). In-scene labels LBL_A..LBL_H: work/short96_SUPERVISOR_FIXES.md
(read by regex, never typed here). Writes captions_vault.json, script_spec.json and timeline.json. No Hebrew is typed here."""
import io, json, re
WORK = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/work'
ANIM = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/anim/short96'
HERE = 'C:/projects/_studio-animatzia/productions/khs_96'
CLIP = 31.98
TAIL = 1.0
DUR = round(CLIP + TAIL, 2)
GROUPS = [[1, 2], [3], [4, 5, 6, 7], [8, 9, 10], [11, 12, 13], [14, 15, 16], [17, 18], [19, 20, 21, 22]]
SHOT_OF_BOX = [0, 1, 2, 3, 4, 5, 6, 7]
SHOTS_ID = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08']

ROWS = json.load(io.open(ANIM + '/captions.json', encoding='utf-8'))
assert len(ROWS) == 22, len(ROWS)
ROW = {r['n']: r for r in ROWS}

GR = []
WS_FIX = {1: 3.6, 2: 7.1}   # display-only: boxes 2 and 3 start later so each box stays >= 3.3 s on screen (verify); speech times unchanged
for k, g in enumerate(GROUPS):
    rows = [ROW[n] for n in g]
    GR.append({'s': WS_FIX.get(k, round(rows[0]['t0'], 2)), 'text': ' '.join(r['text'] for r in rows), 'ids': ['CAP_%02d' % n for n in g]})

CAPS = []
for k, g in enumerate(GR):
    we = GR[k + 1]['s'] if k + 1 < len(GR) else DUR - 0.3
    CAPS.append({'shot': SHOT_OF_BOX[k], 'id': 'G_' + g['ids'][0], 'ws': g['s'], 'we': round(we, 2), 'text': g['text'], 'units': g['ids']})

SHOT_T = [0.0] + [CAPS[SHOT_OF_BOX.index(s)]['ws'] for s in range(1, len(SHOTS_ID))] + [DUR]

FIX = io.open(WORK + '/short96_SUPERVISOR_FIXES.md', encoding='utf-8').read()
LBL = {}
for m in re.finditer(r'^(LBL_[A-H])\s+(\S.*?)\s*$', FIX, re.M):
    LBL[m.group(1)] = m.group(2)
assert len(LBL) == 8, sorted(LBL)

vault = {c['id']: c['text'] for c in CAPS}
vault.update(LBL)
io.open(HERE + '/captions_vault.json', 'w', encoding='utf-8').write(json.dumps(vault, ensure_ascii=True, indent=1))

SHOT_CAPS = [[c for c in CAPS if c['shot'] == k] for k in range(len(SHOTS_ID))]
for k in range(len(SHOTS_ID)):
    print(SHOTS_ID[k], 'from', SHOT_T[k], 'to', SHOT_T[k + 1], 'boxes', [c['id'] for c in SHOT_CAPS[k]])
for c in CAPS:
    print(c['id'], 'win', c['ws'], c['we'], 'len', round(c['we'] - c['ws'], 2), 'units', ','.join(x[4:] for x in c['units']))

shots_tl = []
spec_shots = []
for k, sid in enumerate(SHOTS_ID):
    a, b = SHOT_T[k], SHOT_T[k + 1]
    cs = SHOT_CAPS[k]
    shots_tl.append({'id': sid, 'brief': sid, 'dur': round(b - a, 2), 'briefDur': round(b - a, 2),
                     'captions': [{'id': c['id'], 'at': round(c['ws'] - a, 2), 'until': round(c['we'] - a, 2)} for c in cs],
                     'capAt': [round(c['ws'] - a, 2) for c in cs], 'words': []})
    spec_shots.append({'id': sid, 'dur': round(b - a, 2), 'captions': [{'id': c['id'], 'text': c['text']} for c in cs]})

spec = {'production': 'khs_96', 'films': [{'id': 'film_a', 'title': '', 'kicker': '', 'recap': [], 'shots': spec_shots}]}
io.open(HERE + '/script_spec.json', 'w', encoding='utf-8').write(json.dumps(spec, ensure_ascii=False, indent=1))
tl = {'fps': 30, 'films': {'film_a': {'titleDur': 0, 'recapDur': 0, 'shots': shots_tl, 'audio': {'narration': None, 'music': None}}},
      'shots': shots_tl,
      'voice': {'source': 'real recording of the lecturer, mixed locally; NOT part of the render', 'clipDur': CLIP}}
io.open(HERE + '/timeline.json', 'w', encoding='utf-8').write(json.dumps(tl, ensure_ascii=False, indent=1))
print('written: captions_vault.json, script_spec.json, timeline.json; clip', CLIP, 'total', DUR, 'labels', sorted(LBL))
