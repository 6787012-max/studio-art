"""usage: python sheet.py out.jpg cols thumbw file1 file2 ... -> labelled contact sheet (JPG)."""
import sys, os, re
from PIL import Image, ImageDraw
out, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); files = sys.argv[4:]
th = int(tw * 9 / 16); rows = (len(files) + cols - 1) // cols
sh = Image.new('RGB', (cols * (tw + 6) + 6, rows * (th + 24) + 6), (232, 227, 216)); d = ImageDraw.Draw(sh)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((tw, th)); x = 6 + (i % cols) * (tw + 6); y = 6 + (i // cols) * (th + 24)
    sh.paste(im, (x, y)); m = re.search(r'_(\d+\.\d+)\.jpg$', f); d.text((x + 2, y + th + 4), (m.group(1) if m else os.path.basename(f)), fill=(30, 30, 30))
sh.save(out, quality=84)
print('sheet', out, sh.size)
