import sys
p = 'C:/projects/_studio-animatzia/productions/toldot07_films/film_c/c_s5.js'
s = open(p, encoding='utf-8').read()
a = s.index('export function shot4b(lt, T) {')
b = s.index('/* ---------------------------------------------------------------- recap')
new = open('C:/projects/_studio-animatzia/productions/toldot07_films/film_c/_w/shot4b_new.js', encoding='utf-8').read()
s = s[:a] + new + s[b:]
open(p, 'w', encoding='utf-8').write(s)
print('ok')
