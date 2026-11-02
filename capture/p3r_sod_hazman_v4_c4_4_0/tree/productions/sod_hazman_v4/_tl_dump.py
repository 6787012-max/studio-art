import json, sys, re
sys.stdout.reconfigure(encoding='utf-8')
tl = json.load(open('C:/projects/_studio-animatzia/productions/sod_hazman_v4/timeline.json', encoding='utf-8'))
heb = re.compile('[\u0590-\u05ff]')
print('top keys', list(tl.keys()))
for ch in tl['chapters']:
    if ch['id'] not in sys.argv[1:]:
        continue
    print('CHAPTER', ch['id'], 'dur', ch['dur'], 'keys', [k for k in ch if k != 'lines'])
    for l in ch['lines']:
        d = {}
        for k, v in l.items():
            if k in ('words', 'text'):
                continue
            s = json.dumps(v, ensure_ascii=True)
            if heb.search(str(v)):
                s = '<HEB>'
            d[k] = s if not isinstance(v, (int, float, str)) or heb.search(str(v)) else v
        nw = len(l.get('words', []))
        gold = [i for i, w in enumerate(l.get('words', [])) if w.get('gold')]
        num = [(i, w.get('num')) for i, w in enumerate(l.get('words', [])) if 'num' in w and w.get('num') is not None]
        print(json.dumps(d, ensure_ascii=True), 'nw', nw, 'gold', gold, 'num', num)
