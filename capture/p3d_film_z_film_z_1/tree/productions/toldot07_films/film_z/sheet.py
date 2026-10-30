import sys, glob, os
from PIL import Image, ImageDraw
pat, out, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 4
fs = sorted(glob.glob(pat))
ims = [Image.open(f).convert('RGB') for f in fs]
w, h = ims[0].size
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * w, rows * h), (20, 20, 20))
for i, (f, im) in enumerate(zip(fs, ims)):
    S.paste(im, ((i % cols) * w, (i // cols) * h))
    d = ImageDraw.Draw(S); lab = os.path.basename(f).split('_')[-1][:-4]
    d.rectangle([(i % cols) * w, (i // cols) * h, (i % cols) * w + 74, (i // cols) * h + 20], fill=(0, 0, 0)); d.text(((i % cols) * w + 4, (i // cols) * h + 4), 't=' + lab, fill=(255, 255, 0))
S.save(out, quality=82)
print(out, S.size)
