import re, sys, subprocess, os
base = 'C:/projects/_studio-animatzia/productions/sod_hazman_v4/'
out = 'C:/Users/5F4C~1/AppData/Local/Temp/claude/C--/467208c0-7c53-407b-8ee5-dec60087325b/scratchpad/syn/'
os.makedirs(out, exist_ok=True)
for n in sys.argv[1:]:
    if n.endswith('.html'):
        s = open(base + n, encoding='utf-8').read()
        m = re.search(r'<script type="module">(.*?)</script>', s, re.S)
        open(out + n + '.mjs', 'w', encoding='utf-8').write(m.group(1))
        p = out + n + '.mjs'
    else:
        s = open(base + 'lib_v4/' + n, encoding='utf-8').read()
        p = out + n.replace('.js', '.mjs'); open(p, 'w', encoding='utf-8').write(s)
    r = subprocess.run(['node', '--check', p], capture_output=True, text=True)
    print(n, 'OK' if r.returncode == 0 else r.stderr[:600])
