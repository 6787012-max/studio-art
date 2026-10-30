import io, re
d = 'C:/projects/_studio-animatzia/productions/katzar_k04_3d/'
p = d + 'people.js'
s = io.open(p, encoding='utf-8').read()
a = s.index("import { makeMan as rawMan }")
new = """import { makeMan as rawMan, makeBoy as rawBoy, makeBochur as rawBochur, makeRabbiA as rawA, makeRabbiB as rawB } from '../haredi_cast/cast_people.js';

function wrap(m, scale) {
  m.root.scale.multiplyScalar(scale || 1);
  return {
    kind: 'person', body: m, root: m.root, scale: scale || 1, cycle: m.cycle * (scale || 1),
    pose(po) { m.pose(po); },
    set(po) { m.pose(po); if (po.face) m.face.set(po.face); },
    warm(face) { return m.face.set(face); },
    hand(s) { return m.arms.find(a => a.s === s).wr; },
  };
}
export const makeMan = () => wrap(rawMan(), 1.0);
export const makeBochur = () => wrap(rawBochur(), 1.0);
export const makeBoy = () => wrap(rawBoy(), 1.0);
export const makeRabbiA = () => wrap(rawA(), 1.0);
export const makeRabbiB = () => wrap(rawB(), 1.0);
"""
s = s[:a] + new
s = s.replace("const K = window.K;\n", "")
io.open(p, 'w', encoding='utf-8').write(s)
h = io.open(d + 'film_a.html', encoding='utf-8').read()
h = h.replace('<script src="../haredi_man/man2d.js"></script>', '<script src="../haredi_man/man2d.js"></script><script src="../haredi_cast/people2d.js"></script>')
io.open(d + 'film_a.html', 'w', encoding='utf-8').write(h)
io.open(d + 'render.json', 'w', encoding='utf-8').write('{"render_includes": ["productions/haredi_cast/cast_people.js", "productions/haredi_cast/people2d.js", "productions/haredi_cast/props_lesson.js", "productions/haredi_man/man3d.js", "productions/haredi_man/man2d.js"]}\n')
print('ok')
