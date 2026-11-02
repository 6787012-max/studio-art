# usage: python _sheet_b23.py <dir_with_clean_jpgs> <out.jpg> <substr> [<substr> ...]   2-column sheet, 640x360 tiles
import sys, os
from PIL import Image
d, out, subs = sys.argv[1], sys.argv[2], sys.argv[3:]
fs = sorted(f for f in os.listdir(d) if f.endswith('.jpg') and any('_' + s + '_' in f for s in subs))
ims = [Image.open(d + '/' + f).convert('RGB').resize((640, 360)) for f in fs]
W = Image.new('RGB', (1280, 360 * ((len(ims) + 1) // 2)))
for i, im in enumerate(ims):
    W.paste(im, ((i % 2) * 640, (i // 2) * 360))
W.save(out, quality=85)
print(fs)
