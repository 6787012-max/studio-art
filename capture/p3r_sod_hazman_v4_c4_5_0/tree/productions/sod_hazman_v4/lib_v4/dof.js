// dof.js - depth of field + vignette post pass for stage3d films (v4 house style), plus an "overlay scene" hook.
// Patches THREE.WebGLRenderer.prototype.render once. A scene opts in with scene.userData.dof = {focus (m), ap (px per unit), maxR (px)};
// scene.userData.overlay = THREE.Scene drawn AFTER the pass with the same camera (captions live there, so they are never blurred).
// Everything is a pure function of the values the shot writes each frame (no time, no randomness).
import * as THREE from 'three';

const S = { patched: false, ok: true, rt: null, w: 0, h: 0, quad: null, qs: null, qc: null, mat: null };

const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const FRAG = `
uniform sampler2D tColor; uniform sampler2D tDepth; uniform vec2 res;
uniform float near; uniform float far; uniform float focus; uniform float ap; uniform float maxR; uniform float vig; uniform vec3 tint;
varying vec2 vUv;
float vz(float d){ float z = d * 2.0 - 1.0; return 2.0 * near * far / (far + near - z * (far - near)); }
float coc(float dist){ return clamp(ap * abs(dist - focus) / max(dist, 0.05), 0.0, maxR); }
float cocD(float d, float z){ return d > 0.99995 ? 0.0 : coc(z); }
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
void main(){
  vec3 col = texture2D(tColor, vUv).rgb;
  if (ap > 0.001) {
    float d0 = texture2D(tDepth, vUv).x;
    float z0 = vz(d0);
    float c0 = cocD(d0, z0);
    vec3 acc = col; float ws = 1.0;
    float rot = ign(gl_FragCoord.xy) * 6.2831853;
    for (int i = 1; i <= 36; i++) {
      float fi = float(i);
      float r = sqrt(fi / 36.0);
      float a = fi * 2.39996323 + rot;
      vec2 off = vec2(cos(a), sin(a)) * r * maxR;
      vec2 uv = vUv + off / res;
      float sd = texture2D(tDepth, uv).x;
      float sz = vz(sd);
      float cs = cocD(sd, sz);
      float cEff = (sz > z0) ? min(cs, c0 + 0.5) : cs;
      float w = clamp(cEff - length(off) + 1.0, 0.0, 1.0);
      acc += texture2D(tColor, uv).rgb * w; ws += w;
    }
    col = acc / ws;
  }
  vec2 q = vUv - 0.5; float v = 1.0 - vig * smoothstep(0.25, 0.85, length(q * vec2(1.0, 0.9)) * 1.25);
  col *= v * tint;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

function ensure(r) {
  const sz = r.getSize(new THREE.Vector2());
  const w = Math.round(sz.x), h = Math.round(sz.y);
  if (S.rt && S.w === w && S.h === h) return;
  if (S.rt) { S.rt.depthTexture.dispose(); S.rt.dispose(); }
  const dt = new THREE.DepthTexture(w, h);
  S.rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4, depthTexture: dt, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  S.w = w; S.h = h;
  if (!S.mat) {
    S.mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false,
      uniforms: { tColor: { value: null }, tDepth: { value: null }, res: { value: new THREE.Vector2(w, h) }, near: { value: .05 }, far: { value: 2000 },
        focus: { value: 5 }, ap: { value: 0 }, maxR: { value: 16 }, vig: { value: .3 }, tint: { value: new THREE.Color(1, 1, 1) } } });
    S.qs = new THREE.Scene(); S.qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    S.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), S.mat); S.quad.frustumCulled = false; S.qs.add(S.quad);
  }
  S.mat.uniforms.res.value.set(w, h);
}

function wrapRenderer(r) {
  if (r.__v4) return; r.__v4 = true;
  const orig = r.render;
  r.render = function (scene, camera) {
    const ud = scene && scene.userData, d = ud && ud.dof;
    if (!d || !S.ok || this.getRenderTarget() !== null || ud.nodof) {
      orig.call(this, scene, camera);
    } else {
      try {
        ensure(this);
        this.setRenderTarget(S.rt); orig.call(this, scene, camera); this.setRenderTarget(null);
        const u = S.mat.uniforms;
        u.tColor.value = S.rt.texture; u.tDepth.value = S.rt.depthTexture;
        u.near.value = camera.near; u.far.value = camera.far;
        u.focus.value = Math.max(.05, +d.focus || 5); u.ap.value = Math.max(0, +d.ap || 0); u.maxR.value = Math.max(1, +d.maxR || 16);
        u.vig.value = d.vig === undefined ? .3 : d.vig;
        if (d.tint) u.tint.value.setRGB(d.tint[0], d.tint[1], d.tint[2]); else u.tint.value.setRGB(1, 1, 1);
        orig.call(this, S.qs, S.qc);
      } catch (e) {
        S.ok = false; this.setRenderTarget(null); console.warn('[dof] disabled: ' + (e && e.message));
        orig.call(this, scene, camera);
      }
    }
    const ov = ud && ud.overlay;
    if (ov && ov.visible !== false) {
      const ac = this.autoClear; this.autoClear = false; this.clearDepth(); orig.call(this, ov, camera); this.autoClear = ac;
    }
  };
}
// three.js defines render() per renderer instance, so we hook the renderer from Scene.onBeforeRender (called with the renderer)
export function installDOF() {
  if (S.patched) return; S.patched = true;
  THREE.Scene.prototype.onBeforeRender = function (renderer) { wrapRenderer(renderer); };
}

// register a per-frame DOF controller on a shot world: fn(t, cam) -> {focus, ap, maxR?, vig?, tint?}
export function useDOF(Wd, fn) {
  installDOF();
  Wd.scene.userData.dof = { focus: 5, ap: 0, maxR: 16, vig: .3 };
  Wd.on((t, cam) => { const d = fn(t, cam) || {}; Object.assign(Wd.scene.userData.dof, d); });
}
export const dofState = S;
