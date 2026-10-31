# -*- coding: utf-8 -*-
"""Assemble film.js from film_src_[abcd].js + infrastructure copied from katzar_k04_3d/film.js (ASCII only)."""
import io
base = 'C:/projects/_studio-animatzia/productions/'
old = io.open(base + 'katzar_k04_3d/film.js', encoding='utf-8').read().split('\n')
utils = '\n'.join(old[66:134])      # lines 67..134
face = '\n'.join(old[230:233])      # lines 231..233
herm = '\n'.join(old[547:564])      # lines 548..564
d = base + 'siach_20261030/'
a = io.open(d + 'film_src_a.js', encoding='utf-8').read().replace('//@@UTILS@@', utils).replace('//@@FACE@@', face)
b = io.open(d + 'film_src_b.js', encoding='utf-8').read()
c = io.open(d + 'film_src_c.js', encoding='utf-8').read()
dd = io.open(d + 'film_src_d.js', encoding='utf-8').read()
out = a + '\n' + b + '\n' + herm + '\n' + c + '\n' + dd
bad = [i for i, ch in enumerate(out) if ord(ch) > 127]
print('non-ascii chars:', len(bad), 'lines:', out.count('\n'))
io.open(d + 'film.js', 'w', encoding='utf-8', newline='\n').write(out)
