// מצייר סצנה תלת-ממדית בסגנון איור: צבעים שטוחים (מיצוע קטן שמוחק רעש) + קו דיו אחיד סביב כל צורה,
// שמזוהה בתמונה עצמה מקפיצות בעומק ובכיוון המשטח. שימוש: const I = illus(THREE, renderer, W, H); I.render(scene, camera)
export function illus(THREE, renderer, W, H, o) {
  o = Object.assign({ ink: [0.1, 0.07, 0.05], width: 1.6, flat: 1 }, o || {});
  const mk = () => { const t = new THREE.WebGLRenderTarget(W, H, { samples: 0 }); t.depthTexture = new THREE.DepthTexture(W, H); return t; };
  const rtC = mk(), rtN = new THREE.WebGLRenderTarget(W, H);
  const mat = new THREE.ShaderMaterial({
    uniforms: { col: { value: rtC.texture }, dep: { value: rtC.depthTexture }, nor: { value: rtN.texture }, res: { value: new THREE.Vector2(W, H) },
      ink: { value: new THREE.Vector3(...o.ink) }, wid: { value: o.width }, flt: { value: o.flat }, near: { value: .05 }, far: { value: 200 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
    fragmentShader: `uniform sampler2D col; uniform sampler2D dep; uniform sampler2D nor; uniform vec2 res; uniform vec3 ink; uniform float wid; uniform float flt; uniform float near; uniform float far; varying vec2 vUv;
      float ld(vec2 u){ float z=texture2D(dep,u).x*2.-1.; return (2.*near*far)/(far+near-z*(far-near)); }
      void main(){ vec2 px=wid/res; float d0=ld(vUv); vec3 n0=texture2D(nor,vUv).rgb; float e=0.;
        for(int i=-1;i<=1;i++) for(int j=-1;j<=1;j++){ if(i==0&&j==0) continue; vec2 u=vUv+vec2(i,j)*px; float d=ld(u);
          e=max(e, smoothstep(.025*d0, .045*d0, abs(d-d0))); e=max(e, smoothstep(.35,.62, distance(texture2D(nor,u).rgb,n0))); }
        vec3 c=vec3(0.); for(int i=-1;i<=1;i++) for(int j=-1;j<=1;j++) c+=texture2D(col,vUv+vec2(i,j)/res).rgb; c/=9.;
        c=mix(texture2D(col,vUv).rgb, c, flt);
        gl_FragColor=vec4(mix(c, ink, e*.92),1.);
#include <colorspace_fragment>
      }` });
  const qs = new THREE.Scene(), qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); qs.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  const nmat = new THREE.MeshNormalMaterial();
  return {
    render(scene, cam, vp) {   // vp = [x,y,w,h] אזור במסך (ברירת מחדל: כולו)
      mat.uniforms.near.value = cam.near; mat.uniforms.far.value = cam.far;
      const keep = renderer.getRenderTarget(), ov = scene.overrideMaterial, bg = scene.background;
      renderer.setScissorTest(false);
      renderer.setRenderTarget(rtC); renderer.setViewport(0, 0, W, H); renderer.clear(); renderer.render(scene, cam);
      scene.overrideMaterial = nmat; scene.background = null; renderer.setRenderTarget(rtN); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, cam);
      scene.overrideMaterial = ov; scene.background = bg;
      renderer.setRenderTarget(keep); const v = vp || [0, 0, W, H]; renderer.setViewport(...v); renderer.setScissor(...v); renderer.setScissorTest(true); renderer.render(qs, qc); renderer.setScissorTest(false);
    },
  };
}
