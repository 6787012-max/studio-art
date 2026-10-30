import json, subprocess, sys
tl = json.load(open('C:/projects/_studio-animatzia/productions/toldot07_films/film_c/timeline.json'))
ts = []
for s in tl['shots']:
    t0, d = s['t0'], s['dur']
    ts += [t0 + 1.0, t0 + d / 2, t0 + d - 1.0]
print(','.join('%.2f' % t for t in ts))
