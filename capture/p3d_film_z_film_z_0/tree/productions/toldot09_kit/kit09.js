/* toldot09_kit - lesson 9 (the Dead Sea). Re-exports kit08 (which re-exports kit07) and adds the lesson's own pieces.
   MELACH = the salt crystal character (films b-e, z): the kit07 sand grain rig (same face, hops, poses) recoloured to white salt,
   with small crystal cubes growing on its back so it reads as salt. Use exactly like makeGrain(): c.root, c.pose(po), c.face, c.height.
   Builders: add new lesson-9 pieces to THIS file only (append, never edit kit07.js / kit08.js / lib). */
import * as K8 from '../toldot08_kit/kit08.js';
export * from '../toldot08_kit/kit08.js';
import { THREE } from '../../lib/toon3d/toon3d.js';

const SALT = '#f3f6ff', SALT_SH = '#c9d6ee';

function recolor(root, from, to) {
  const f = new THREE.Color(from), t = new THREE.Color(to);
  root.traverse(o => {
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of ms) {
      const u = m.uniforms && m.uniforms.uColor;
      if (u && u.value && u.value.r !== undefined) {
        const c = u.value;
        if (Math.abs(c.r - f.r) + Math.abs(c.g - f.g) + Math.abs(c.b - f.b) < 0.12) c.copy(t);
      } else if (m.color && Math.abs(m.color.r - f.r) + Math.abs(m.color.g - f.g) + Math.abs(m.color.b - f.b) < 0.12) m.color.copy(t);
    }
  });
}

export function makeMelach() {
  const c = K8.makeGrain();
  recolor(c.root, '#e9c987', SALT);
  recolor(c.root, '#c79a58', SALT_SH);
  const inner = c.inner || c.root;
  const cubeMat = K8.M('#ffffff', '#c8d4ec', 0);
  const spots = [[-52, 150, -40, 26], [-66, 96, -30, 22], [-40, 176, 10, 18], [-70, 60, 30, 16], [-30, 40, -70, 14]];
  for (const [x, y, z, s] of spots) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), cubeMat);
    m.position.set(x, y, z); m.rotation.set(0.5 + x * 0.01, 0.7 + y * 0.004, 0.3); inner.add(m);
  }
  c.kind = 'melach';
  return c;
}
