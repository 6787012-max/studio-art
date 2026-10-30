"""usage: python stills.py [round] -> renders 4 frames per shot (start+1, 1/3, 2/3, end-1) and builds STILLS.jpg (labelled). JPG only."""
import json, subprocess, sys, os
from PIL import Image, ImageDraw
D = 'C:/projects/_studio-animatzia/productions/toldot07_films/film_d'
rnd = sys.argv[1] if len(sys.argv) > 1 else '1'
tl = json.load(open(D + '/timeline.json'))
times, labels = [], []
for s in tl['shots']:
    t0, d = s['t0'], s['dur']
    for k, t in enumerate([t0 + 1.0, t0 + d * 0.34, t0 + d * 0.67, t0 + d - 1.0]):
        times.append(round(t, 2)); labels.append('%s  t=%.1f (local %.1f)' % (s['id'], t, t - t0))
out = D + '/_scratch/st%s' % rnd
r = subprocess.run([sys.executable, D + '/snap.py', out, '960', ','.join('%.2f' % t for t in times)], capture_output=True, text=True)
print(r.stdout[-600:], r.stderr[-300:])
tw = 480; th = 270; cols = 4; rows = len(tl['shots'])
sh = Image.new('RGB', (cols * (tw + 6) + 6, rows * (th + 22) + 6), (232, 227, 216)); d = ImageDraw.Draw(sh)
for i, t in enumerate(times):
    fn = '%s_%06.2f.jpg' % (out, t)
    im = Image.open(fn).convert('RGB').resize((tw, th)); x = 6 + (i % cols) * (tw + 6); y = 6 + (i // cols) * (th + 22)
    sh.paste(im, (x, y)); d.text((x + 2, y + th + 4), labels[i], fill=(30, 30, 30))
sh.save(D + '/STILLS.jpg', quality=84)
print('saved STILLS.jpg', sh.size)
