import sys, glob, os
from PIL import Image, ImageDraw
d = sys.argv[1]; out = sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 2
fs = sorted(glob.glob(d + '/f_*.jpg'))
W, H = 800, 450
rows = (len(fs) + cols - 1) // cols
img = Image.new('RGB', (W * cols, H * rows), 'black'); dr = ImageDraw.Draw(img)
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGB').resize((W, H)); x, y = (i % cols) * W, (i // cols) * H
    img.paste(im, (x, y)); dr.rectangle([x, y, x + 120, y + 18], fill=(0, 0, 0)); dr.text((x + 4, y + 3), os.path.basename(f)[2:-4], fill=(255, 255, 255))
img.save(out, quality=85); print(img.size)
