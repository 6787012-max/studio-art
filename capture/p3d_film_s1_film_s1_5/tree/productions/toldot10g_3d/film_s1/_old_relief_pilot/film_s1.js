/* film_s1 (toldot10g) - lesson 10 review, station 1: reading a map. Table-and-set method of gezer_trip. NO PEOPLE, NO TEXT. ASCII only.
   Deterministic: every frame is a pure function of t. Contract: __ready, __seek(t) (adds __T0), __dur, __shots, __caption, __heroBox.
   Layout: persistent room/table/relief/Tipa, one group + upd() per shot (shots_ab.js, shots_cd.js, shots_xqe.js). */
import * as K from '../toldot10g_kit/kit10g.js';
import { shotA, shotB } from './shots_ab.js';
import { shotC, shotD } from './shots_cd.js';
import { shotX, shotQ, shotE } from './shots_xqe.js';

const Q = new URLSearchParams(location.search);
const HQ = !!(window.__HQ_RENDER || Q.has('hq') || Q.has('capture'));
window.__dur = 136.72; window.__errors = [];
async function main() {
const S = K.setup(HQ), { renderer, scene, cam, hemi, sun } = S;
const DUR = 136.72;

const room = K.makeRoom(); scene.add(room);
const table = K.makeTable(); scene.add(table);
const relief = K.makeRelief(); scene.add(relief.root);
const motes = K.makeMotes(150); scene.add(motes);
const sky = K.makeSky(); scene.add(sky);
const tipa = K.makeTipaRig(scene);
const ctx = { K, cam, scene, relief, room, table, sky, tipa, hemi, sun, S, setSun: S.setSun };

const SH = [shotA(ctx), shotB(ctx), shotC(ctx), shotD(ctx), shotX(ctx), shotQ(ctx), shotE(ctx)];
SH.forEach(s => { scene.add(s.grp); s.grp.visible = false; });

let HERO = null;
  const EV = []; const ev = (t, kind) => EV.push({ t, kind });
  [0.6, 10.28, 18.2, 28.01, 37.31, 48.43, 52.42, 63.0, 71.23, 77.97, 85.22, 92.04, 99.3, 106.15, 112.21, 114.82, 122.06, 126.12].forEach(t => ev(t + 0.05, 'pop'));
  SH.forEach(s => { if (s.t0 > 0) ev(s.t0 - 0.3, 'whoosh'); });
  [111.91, 112.91, 113.91, 121.76, 122.76, 123.76].forEach(t => ev(t, 'tick')); ev(112.21, 'ding'); ev(122.06, 'ding');
  window.__events = EV.sort((a, b) => a.t - b.t); window.__heroBox = () => HERO;
function frame(tl) {
  const t = Math.max(0, Math.min(DUR, tl));
  let si = 0; for (let i = 0; i < SH.length; i++) if (t >= SH[i].t0) si = i;
  const s = SH[si], lt = t - s.t0;
  SH.forEach((x, i) => { x.grp.visible = i === si; });
  const md = s.mode ? s.mode(lt) : { env: s.env, relief: s.relief }, inRoom = md.env === 'room';
  room.visible = table.visible = motes.visible = inRoom; relief.root.visible = inRoom && !!md.relief; sky.visible = !inRoom;
  S.fill.color.set('#ffe9cf'); S.fill.intensity = 0.55; S.cam.fov = 36; S.cam.updateProjectionMatrix();
  hemi.color.set('#dfe8f3'); hemi.groundColor.set('#a68a62'); hemi.intensity = 1.25; sun.color.set('#ffe0a6'); sun.intensity = 2.5; scene.fog = null; scene.background.set('#d8c9a8');
  if (inRoom) S.setSun(...(s.sun || [0, 0, 0, -95, 80, -70, 150]));
  relief.setGlow(0, 0, 0, 0); relief.setRise(0); relief.setSpot(31.78, 35.12, 6);
  s.upd(lt, t);
  relief.update(t); motes.userData.update(t, cam); sky.position.copy(cam.position);
  const o = s.tipa ? s.tipa(lt, t) : null;
  if (o) tipa.place(t, Object.assign({ cam }, o)); else tipa.T.root.visible = false;
  /* hero = the set piece of the shot (relief map when shown, else the shot group); Tipa is a side character with her own 16 % rule */
  { const tg = md.relief && inRoom ? relief.root : s.grp, bx = new K.THREE.Box3().setFromObject(tg), fw = new K.THREE.Vector3(); cam.getWorldDirection(fw);
    let mnx = 9, mxx = -9, mny = 9, mxy = -9, front = 0, v = new K.THREE.Vector3();
    for (let i = 0; i < 8; i++) { v.set(i & 1 ? bx.max.x : bx.min.x, i & 2 ? bx.max.y : bx.min.y, i & 4 ? bx.max.z : bx.min.z); if (v.clone().sub(cam.position).dot(fw) > 0.1) front++;
      v.project(cam); mnx = Math.min(mnx, v.x); mxx = Math.max(mxx, v.x); mny = Math.min(mny, v.y); mxy = Math.max(mxy, v.y); }
    HERO = { visible: front > 0 && mxx > -1 && mnx < 1 && mxy > -1 && mny < 1, behindCamera: front === 0, heightFrac: Math.max(0, Math.min(1, (Math.min(mxy, 1) - Math.max(mny, -1)) / 2)), box: [mnx, mny, mxx, mxy] }; }
  renderer.render(scene, cam);
}

window.__dur = DUR; window.__HQ = HQ;
window.__shots = SH.map((s, i) => ({ id: s.id, index: i, t0: s.t0, dur: +(s.t1 - s.t0).toFixed(2) }));
window.__caption = () => null; window.__sceneHash = () => 'toldot10g-s1-v1'; window.__errors = [];
window.__seek = t => { try { frame(t + (window.__T0 || 0)); } catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); throw e; } return true; };
(async () => {
  try { await tipa.warm(); for (const s of SH) frame(s.t0 + 0.5); frame(Q.has('t') ? +Q.get('t') : 0); window.__ready = true; }
  catch (e) { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }
})();

}
setTimeout(() => { main().catch(e => { window.__errors.push(String(e && e.stack || e).slice(0, 500)); console.error(e); }); }, 0);
