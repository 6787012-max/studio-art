# -*- coding: utf-8 -*-
import sys, json
from playwright.sync_api import sync_playwright
T = sys.argv[1] if len(sys.argv) > 1 else '2.5'
url = 'file:///C:/projects/_studio-animatzia/productions/siach_20261030/film_a.html?capture&hq=1'
js = """(T) => {
  const grab = () => { const out = []; const sc = window.__scene; sc.traverse(o => { if (o.visible !== false) { const e = o.matrixWorld.elements; out.push([o.type, o.name || '', Math.round(e[12]*10), Math.round(e[13]*10), Math.round(e[14]*10), Math.round(e[0]*100)]); } }); return out; };
  window.__seek(T); const a = grab(); window.__seek(0); window.__seek(T); const b = grab();
  const diffs = []; for (let i = 0; i < Math.max(a.length, b.length); i++) { if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) diffs.push([i, a[i], b[i]]); }
  return { n: a.length, m: b.length, d: diffs.slice(0, 8), nd: diffs.length };
}"""
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files', '--ignore-gpu-blocklist'])
    try:
        pg = b.new_page(viewport={'width': 640, 'height': 360})
        pg.goto(url, wait_until='load')
        pg.wait_for_function('window.__ready === true', timeout=120000)
        print(json.dumps(pg.evaluate(js, float(T)))[:1500])
    finally:
        b.close()
