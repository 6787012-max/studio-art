/* people.js - the ONE adapter between the film and the person model (productions/haredi_man/man3d.js).
   Everything in the film that is a person goes through makeMan / makeBochur / makeBoy / makeRabbiA / makeRabbiB.
   Returned object (the only API the film uses):
     { root, kind, scale, cycle, pose(po), set(po), hand(side), body }
       pose(po)  -> the model pose (po.x/z, yaw, walk, ph, lean, headYaw, headRot, headTilt, arms:{l,r}, face)
       set(po)   -> pose + face update (synchronous when the face variant is cached - see warm())
       cycle     -> walk cycle length in world units (already multiplied by the scale; use ph = distance / cycle)
       hand(s)   -> wrist bone (s = -1 left / +1 right) to attach a held object
       warm(face)-> async: caches a face state so set() stays synchronous
   If the man model API changes, only this file needs updating. */
import { makeMan as rawMan, makeBoy as rawBoy, makeBochur as rawBochur, makeRabbiA as rawA, makeRabbiB as rawB } from '../haredi_cast/cast_people.js';

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
