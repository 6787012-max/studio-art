# -*- coding: utf-8 -*-
"""Supervisor tool for khs_87 (napoleon / "a nation with a past has a future").
Builds script_spec.json from the VERIFIED Phase-A word list (short87_words.json, absolute lesson times) mapped onto the
output timeline with the Phase-A keep ranges. Captions are cut from real word times; no Hebrew is typed in this file.
Step 2 (--timeline) patches timeline.json with the real caption windows (same pattern as khs_85)."""
import io, json, sys
WORK = 'D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/work'
HERE = 'C:/projects/_studio-animatzia/productions/khs_87'
WORDS = json.load(io.open(WORK + '/short87_words.json', encoding='utf-8'))
KEEP = json.load(io.open(WORK + '/short87_keep.json', encoding='utf-8'))['keep']
CLIP = round(sum(b - a for a, b in KEEP), 2)          # spoken length on the output timeline (83.79)
TAIL = 0.8                                             # still time after the voice; compose trims to CLIP
DUR = round(CLIP + TAIL, 2)

def out_t(t):
    """absolute lesson time -> output-timeline time (cut ranges removed)"""
    off = 0.0
    for a, b in KEEP:
        if t < a:
            return off
        if t <= b:
            return off + (t - a)
        off += b - a
    return off

OUTW = [(round(out_t(w['t']), 3), w['w']) for w in WORDS]

# shots on the output timeline (seconds) and captions per shot (windows are cut from word times)
BOUNDS = [0.0, 11.0, 22.5, 39.0, 50.5, 61.5, 74.0, DUR]
NCAP = [2, 2, 3, 2, 2, 2, 2]
SHOTS_ID = ['s01', 's02', 's03', 's04', 's05', 's06', 's07']

def split_points(a, b, n):
    # every caption window must be >= 4.8 s: a split o must leave >= 5.1 s after the previous split (0.3 s lead-in)
    # and enough room for the remaining captions (4.5 s each, last one ends at the shot end)
    pts = [a]
    for i in range(1, n):
        tgt = a + (b - a) * i / n
        lo_b = pts[-1] + 5.1
        hi_b = b - 4.5 * (n - i)
        cand = [o for o, _ in OUTW if lo_b < o < hi_b]
        if not cand:
            print('WARNING no word split for shot', a, b, 'split', i)
            cand = [o for o, _ in OUTW if a < o < b]
        pts.append(min(cand, key=lambda o: abs(o - tgt)))
    return pts

def text_of(lo, hi, last):
    return ' '.join(w for o, w in OUTW if lo <= o < (hi if not last else 1e9))

CAPS = []   # (id, win_start, win_end, text_lo, text_hi, is_last_in_film, shot_index)
n = 0
for k, sid in enumerate(SHOTS_ID):
    a, b = BOUNDS[k], BOUNDS[k + 1]
    pts = split_points(a, b, NCAP[k])
    ws = a   # windows of one shot are contiguous; each window ends at the next word split minus 0.3 s, but never < 4.8 s
    for j in range(NCAP[k]):
        n += 1
        lo = pts[j]
        hi = pts[j + 1] if j + 1 < NCAP[k] else b
        we = b if j + 1 == NCAP[k] else max(hi - 0.3, ws + 4.8)
        CAPS.append(('CAP_A_%02d' % n, round(ws, 2), round(we, 2), lo, hi, k, j))
        ws = we

for cid, ws, we, lo, hi, k, j in CAPS:
    if we - ws < 4.8:
        print('WARNING window < 4.8 s:', cid, round(we - ws, 2))

def caps_of_shot(k):
    return [c for c in CAPS if c[5] == k]

def text_for(c):
    cid, ws, we, lo, hi, k, j = c
    last = (cid == CAPS[-1][0])
    return ' '.join(w for o, w in OUTW if lo <= o < (hi if not last else 1e9))

if '--timeline' not in sys.argv:
    shots = []
    for k, sid in enumerate(SHOTS_ID):
        a, b = BOUNDS[k], BOUNDS[k + 1]
        shots.append({'id': sid, 'dur': round(b - a, 2),
                      'captions': [{'id': c[0], 'text': text_for(c)} for c in caps_of_shot(k)]})
    spec = {'production': 'khs_87', 'films': [{'id': 'film_a', 'title': '', 'kicker': '', 'recap': [], 'shots': shots}]}
    io.open(HERE + '/script_spec.json', 'w', encoding='utf-8').write(json.dumps(spec, ensure_ascii=False, indent=1))
    print('script_spec.json written; captions:', len(CAPS), 'total dur', DUR, 'clip', CLIP)
    for c in CAPS:
        print(c[0], 'win', c[1], c[2], 'len', round(c[2] - c[1], 2), 'words', len(text_for(c).split()), 'shot', SHOTS_ID[c[5]])
else:
    tl = json.load(io.open(HERE + '/timeline.json', encoding='utf-8'))
    films = tl.get('films', {})
    targets = [films['film_a']] if 'film_a' in films else []
    if 'shots' in tl:
        targets.append(tl)  # patch BOTH (failure log 23/10)
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
