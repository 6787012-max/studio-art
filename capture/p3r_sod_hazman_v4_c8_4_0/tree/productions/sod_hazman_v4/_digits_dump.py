import json, sys, re
sys.stdout.reconfigure(encoding='utf-8')
base = 'C:/projects/_studio-animatzia/productions/sod_hazman_v4/'
tl = json.load(open(base + 'timeline.json', encoding='utf-8'))
vault = json.load(open(base + 'captions_vault.json', encoding='utf-8'))
for ch in tl['chapters']:
    if ch['id'] not in sys.argv[1:]:
        continue
    print('CH', ch['id'], 'title key', 'T_' + ch['id'].upper(), ('T_' + ch['id'].upper()) in vault)
    for l in ch['lines']:
        if 'cap' not in l:
            print(l['id'], 'no cap'); continue
        t = vault.get(l['cap'], '')
        digs = re.findall(r'[0-9][0-9:.,/]*', t)
        nlines = t.count('\n') + 1
        print(l['id'], l['kind'], 'chars', len(t), 'digits', digs, 'q' if t.strip().endswith('?') else '')
    print('other vault keys', [k for k in vault if k.startswith(ch['id'].upper() + '_') and not re.match(r'C\d+_L\d+', k)][:40])
