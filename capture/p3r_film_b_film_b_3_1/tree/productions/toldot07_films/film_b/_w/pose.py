import sys, os, json
sys.path.insert(0,'C:/projects/_studio-animatzia/tools'); import heavy_lock
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
t=float(sys.argv[1]); out=sys.argv[2]; variants=json.loads(open(sys.argv[3]).read()); w=int(sys.argv[4]) if len(sys.argv)>4 else 640
heavy_lock.acquire('film_b_pose')
files=[]
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge',args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':w,'height':round(w*9/16)})
    pg.goto('http://127.0.0.1:8790/productions/toldot07_films/film_b/film_b.html?hq=1&w=%d&nowarm=1'%w)
    pg.wait_for_function('window.__ready===true',timeout=600000)
    for i,v in enumerate(variants):
        pg.evaluate('t=>window.__seek(t)',t)
        pg.evaluate('''([who,po])=>{const d=window.__dbg; const a=d.AC[who]; const cur=a.o; cur.pose(Object.assign({t:window.__T0||0},po)); if(po.y!=null)cur.root.position.y=po.y; d.renderer.render(d.scene,d.cam);}''',[v['who'],v['po']])
        fn=os.path.join(out,'v%d.jpg'%i); pg.screenshot(path=fn,type='jpeg',quality=85); files.append(fn)
    b.close()
cols=3; h=round(w*9/16); rows=(len(files)+cols-1)//cols
sh=Image.new('RGB',(cols*w,rows*(h+16)),(230,225,215)); d=ImageDraw.Draw(sh)
for i,f in enumerate(files):
    sh.paste(Image.open(f),((i%cols)*w,(i//cols)*(h+16)+16)); d.text(((i%cols)*w+4,(i//cols)*(h+16)+2),str(i)+' '+json.dumps(variants[i]['po'].get('arms'))[:90],fill=(0,0,0))
sh.save(os.path.join(out,'s.jpg'),quality=85)
