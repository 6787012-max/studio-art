from PIL import Image, ImageDraw
d = 'C:/projects/_studio-animatzia/productions/katzar_k04_3d/'
T = [(1,5,9,13),(15,21,25,29),(31,35,39,42),(43,48,56,62.5),(64,72,80,83),(90,100,110,122),(126.5,127.5,128.2,128.9),(134,143,150,157),(161,166,171,175),(178,184,188,192),(194,199,204,209)]
W, H = 800, 450
img = Image.new('RGB', (W * 4, H * len(T)), 'black'); dr = ImageDraw.Draw(img)
for r, row in enumerate(T):
    for c, t in enumerate(row):
        im = Image.open(d + '_st3/f_%06.2f.jpg' % t).convert('RGB').resize((W, H))
        img.paste(im, (c * W, r * H))
        dr.rectangle([c * W, r * H, c * W + 150, r * H + 22], fill=(0, 0, 0))
        dr.text((c * W + 6, r * H + 5), 's%02d  t=%.1f' % (r + 1, t), fill=(255, 255, 255))
img.save(d + 'STILLS.jpg', quality=88)
print(img.size)
