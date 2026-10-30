
/* ------------------------------------------------------------------ render + contract */
let cur_t = 0;
function frame(t) {
  t = cl(t, 0, DUR); cur_t = t;
  const s = shotAt(t);
  applyEnv(t); applyActors(t);
  const c = s.cam(t);
  cam.fov = c.fov || 30; cam.updateProjectionMatrix(); cam.position.set(c.p[0], c.p[1], c.p[2]); cam.lookAt(c.l[0], c.l[1], c.l[2]);
  cam.updateMatrixWorld(true);
  sky.position.copy(cam.position);
  renderer.render(scene, cam);
}
async function warm() {
  const seen = new Set(); const jobs = [];
  for (let k = 0; k <= DUR * 30; k++) {
    const t = k / 30; cur_t = t;
    for (const id in ACT) { const A = ACT[id]; if (!A.person) continue; let st; try { st = A.fn(t); } catch (e) { continue; } if (!st || !st.po.face) continue; const key = id + JSON.stringify(st.po.face); if (seen.has(key)) continue; seen.add(key); jobs.push([A, st.po.face]); }
  }
  for (const [A, f] of jobs) await (A.o.warm ? A.o.warm(f) : A.o.face.set(f));
  return jobs.length;
}
window.__ACT = ACT; window.__dur = DUR; window.__HQ = HQ; window.__errors = [];
window.__shots = SHOTS.map(s => ({ id: s.id, index: s.index, start: s.start, dur: s.dur, end: s.end, wide: !!s.wide }));
window.__caption = () => null;
const _box = new THREE.Box3(), _pv = new THREE.Vector3();
window.__heroBox = t => {
  const s = shotAt(t); cur_t = t; const ids = s.hero || []; let n = 0;
  _box.makeEmpty();
  for (const id of ids) { const A = ACT[id]; if (A && A.h.visible) { A.h.updateMatrixWorld(true); _box.expandByObject(A.h); n++; } }
  if (!n || _box.isEmpty()) return null;
  const mn = [1e9, 1e9], mx = [-1e9, -1e9]; let behind = true;
  for (const x of [_box.min.x, _box.max.x]) for (const y of [_box.min.y, _box.max.y]) for (const z of [_box.min.z, _box.max.z]) {
    _pv.set(x, y, z).project(cam); const cz = _pv.z; if (cz < 1) behind = false;
    mn[0] = Math.min(mn[0], _pv.x); mn[1] = Math.min(mn[1], _pv.y); mx[0] = Math.max(mx[0], _pv.x); mx[1] = Math.max(mx[1], _pv.y);
  }
  const vis = !behind && mx[0] > -1 && mn[0] < 1 && mx[1] > -1 && mn[1] < 1;
  return { visible: vis, behindCamera: behind, heightFrac: (mx[1] - mn[1]) / 2, bottomFrac: (1 - (mn[1] + 1) / 2), box: [mn, mx] };
};
window.__sceneHash = () => { let h = 0; scene.traverse(o => { if (o.visible !== false) { const e = o.matrixWorld.elements; h = (h * 31 + Math.round(e[12] * 10) + Math.round(e[13] * 10) * 7 + Math.round(e[14] * 10) * 13 + Math.round(e[0] * 100) * 3) | 0; } }); return h + '|' + cam.position.x.toFixed(2) + '|' + cam.position.y.toFixed(2); };
const _OFF = window.__T0 || 0;
window.__seek = t => { try { frame(Math.max(0, +t || 0) + _OFF); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); throw e; } return true; };

(async () => {
  try {
    if (Q.has('nowarm')) { window.__nwarm = 0; } else window.__nwarm = await warm();
    frame(Q.has('t') ? +Q.get('t') : 0);
    window.__ready = true;
  } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 400)); console.error(e); }
})();
