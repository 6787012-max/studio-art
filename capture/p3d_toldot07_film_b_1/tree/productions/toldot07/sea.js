// sea.js - toldot07 shared sea (built once; API is stable, others import).
//
// import { sea, beach, bottle } from './sea.js';
//
// const S = sea(Wd, {amp, wavelength, speed, dir, shallow, deep, calm, gust, y, glint, follow});
//   amp         number | t=>metres: crest height of the wave train (default .3). Pure function of t.
//   wavelength  primary wavelength in m (8).   speed: m/s (default deep-water sqrt(g*L/2pi)).
//   dir         travel direction in degrees: 0 = +x, 90 = +z, 180 = -x (default 0).
//   calm        amplitude of the always-present micro swell (.004). With amp<=calm the sea is a mirror that reflects the sky.
//   gust        {front: t=>s, width: 14}: only water behind the front (x*dirx+z*dirz < s) is rough; use for "a gust runs across".
//   y           water level (0).   follow: recentre the mesh under the camera (true).   glint: sun glitter strength (1).
//   returns S = {mesh, heightAt(x,z,t), slopeAt(x,z,t)->[dh/dx,dh/dz], rideAt(x,z,t,rmax=.07)->{pos,gx,gz} (a floating object's
//   position: y from the surface, x/z orbit radius <= rmax, never travels), speed, wavelength, k, dir:[dx,dz], ampAt(t)}
// const B = beach(Wd, {slope .1, x0 0, z0 -20, z1 20, xMax 40, xMin -14, floor -3, wetX})
//   sand strip: height y = (x-x0)*slope, clamped below at floor; x0 is where the sand meets y=0. Returns {mesh, heightAt(x), x0, slope,
//   tongue(opts)}.  B.tongue({t0, dur, xBreak, xMax, z0, z1, thick}) = a wave tongue that runs up the sand, loses height, soaks away
//   (water sheet + foam edge + wet-sand darkening, pure function of t).
// const g = bottle(Wd, {sea, at:[x,z], scale 1, yaw, fn})   the hero: red translucent glass bottle (.35 m * scale) with gold cap.
//   With sea: rides the waves. Without: fn(t)->{pos:[x,y,z], rx, rz}. Returns the Group (use Wd.hero = g).
import { THREE, toon, ink, cyl, canvasTex, clamp, ease, prog, D } from '../../lib/stage3d.js';
import { PAL } from './shared.js';

const COMP = [[1, 1, 0, 0], [.52, .34, 24, 1.3], [.3, .14, -33, 2.9]];   // wavelength mul, amp mul, direction offset deg, phase
const sstep = (v, w) => { const t = clamp(v / w, 0, 1); return t * t * (3 - 2 * t); };
const col = (h, scale) => { const c = new THREE.Color(h); return new THREE.Vector3(c.r, c.g, c.b); };   // raw (display) values, see note below
const raw = h => { const r = (h >> 16 & 255) / 255, g = (h >> 8 & 255) / 255, b = (h & 255) / 255; return new THREE.Vector3(r, g, b); };

const WAVES = `
uniform float uT,uA,uCal,uFront,uWid,uY; uniform vec2 uGD; uniform vec4 uC[3]; uniform vec2 uD[3];
void waves(vec2 p, out float h, out vec2 g, out float A, out float gf){
  float v=clamp((uFront-dot(p,uGD))/uWid,0.,1.); gf=v*v*(3.-2.*v);
  A=uCal+(uA-uCal)*gf; h=0.; g=vec2(0.);
  for(int i=0;i<3;i++){ float th=uC[i].x*dot(p,uD[i])-uC[i].y*uT+uC[i].w;
    float f=sin(th)+.22*sin(2.*th+.6); float df=uC[i].x*(cos(th)+.44*cos(2.*th+.6));
    h+=A*uC[i].z*f; g+=A*uC[i].z*df*uD[i]; } }`;
const VERT = WAVES + `
varying vec3 vW;
void main(){ vec4 wp=modelMatrix*vec4(position,1.); float h; vec2 g; float A,gf; waves(wp.xz,h,g,A,gf); wp.y+=uY+h; vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }`;
const FRAG = WAVES + `
uniform vec3 uShallow,uDeep,uFoam,uSkyTop,uSkyBot,uSunCol,uFogC,uSun; uniform float uFogN,uFogF,uGlint;
varying vec3 vW;
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y); }
void main(){
  float h; vec2 g; float A,gf; waves(vW.xz,h,g,A,gf);
  float act=clamp((A-uCal)*9.,0.,1.);
  vec2 mp=vW.xz*2.3+uD[0]*uT*.7; float v0=vn(mp);
  vec2 pg=vec2(vn(mp+vec2(.06,0.))-v0, vn(mp+vec2(0.,.06))-v0)/.06;
  float ps=mix(.012,.16,clamp(A*6.,0.,1.));
  vec3 n=normalize(vec3(-g.x-pg.x*ps, 1., -g.y-pg.y*ps));
  vec3 v=normalize(cameraPosition-vW);
  float nv=max(dot(n,v),0.);
  float fres=.07+.93*pow(1.-nv,3.5);
  vec3 r=reflect(-v,n); r.y=abs(r.y);
  vec3 sky=mix(uSkyBot,uSkyTop,smoothstep(0.,.62,r.y));
  float sd=max(dot(r,uSun),0.);
  sky+=uSunCol*(pow(sd,16.)*.38+pow(sd,160.)*.9);
  float hn=h/max(A*1.45,.02);
  vec3 body=mix(uDeep,uShallow,smoothstep(-.85,.95,hn));
  float diff=dot(n,uSun); float band=diff>.55?1.:(diff>.2?.9:.8); body*=band;
  vec3 c=mix(body,sky,fres);
  c+=uSunCol*(step(.4,pow(sd,420.))*1.5*act+pow(sd,70.)*.55*(1.-act))*uGlint;
  float nz=vn(vW.xz*1.35+uD[0]*uT*.35)*.6+vn(vW.xz*3.7-uD[1]*uT*.5)*.4;
  float fv=hn+(nz-.5)*.6;
  float foam=step(.72,fv)*act;
  float wash=step(.58,fv)*act*(1.-foam);
  c=mix(c,mix(c,uFoam,.5),wash);
  c=mix(c,uFoam*(.9+.1*band),foam);
  float d=length(cameraPosition-vW); c=mix(c,uFogC,smoothstep(uFogN,uFogF,d));
  gl_FragColor=vec4(c,1.);
}`;

function discGeo(rMax, rings, sect) {   // polar grid, rings grow geometrically: fine near the centre (camera), coarse far away
  const pos = [], idx = [], r0 = .25, gr = Math.pow(rMax / r0, 1 / (rings - 1));
  pos.push(0, 0, 0);
  for (let i = 0; i < rings; i++) { const r = r0 * Math.pow(gr, i); for (let j = 0; j < sect; j++) { const a = j / sect * Math.PI * 2; pos.push(Math.cos(a) * r, 0, Math.sin(a) * r); } }
  for (let j = 0; j < sect; j++) idx.push(0, 1 + (j + 1) % sect, 1 + j);
  for (let i = 0; i < rings - 1; i++) for (let j = 0; j < sect; j++) {
    const a = 1 + i * sect + j, b = 1 + i * sect + (j + 1) % sect, c = a + sect, d = b + sect; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); return g;
}

export function sea(Wd, o) {
  o = o || {};
  const lam = o.wavelength || 8, speed = o.speed !== undefined ? o.speed : Math.sqrt(9.81 * lam / (2 * Math.PI)), dirDeg = o.dir || 0;
  const ampFn = typeof o.amp === 'function' ? o.amp : (() => o.amp === undefined ? .3 : o.amp), calm = o.calm === undefined ? .004 : o.calm;
  const Y = o.y || 0, gust = o.gust || null, gw = gust ? (gust.width || 14) : 1;
  const comps = COMP.map(c => { const L = lam * c[0], k = Math.PI * 2 / L, a = (dirDeg + c[2]) * D;
    return { k, w: k * speed * Math.sqrt(c[0]), am: c[1], ph: c[3], dx: Math.cos(a), dz: Math.sin(a) }; });
  const gdx = comps[0].dx, gdz = comps[0].dz;
  const core = (x, z, t) => {
    const A0 = ampFn(t) / 1.5, cal = calm / 1.5, front = gust ? gust.front(t) : 1e5, gf = sstep(front - (x * gdx + z * gdz), gw), A = cal + (A0 - cal) * gf;
    let h = 0, gx = 0, gz = 0, th0 = 0;
    comps.forEach((c, i) => { const th = c.k * (x * c.dx + z * c.dz) - c.w * t + c.ph; if (!i) th0 = th;
      const f = Math.sin(th) + .22 * Math.sin(2 * th + .6), df = c.k * (Math.cos(th) + .44 * Math.cos(2 * th + .6)); h += A * c.am * f; gx += A * c.am * df * c.dx; gz += A * c.am * df * c.dz; });
    return { h, gx, gz, A, th0 };
  };
  const sk = Wd.sky.material.uniforms, fog = Wd.scene.fog;
  const U = { uT: { value: 0 }, uA: { value: 0 }, uCal: { value: calm / 1.5 }, uFront: { value: 1e5 }, uWid: { value: gw }, uY: { value: Y }, uGD: { value: new THREE.Vector2(gdx, gdz) },
    uC: { value: comps.map(c => new THREE.Vector4(c.k, c.w, c.am, c.ph)) }, uD: { value: comps.map(c => new THREE.Vector2(c.dx, c.dz)) },
    uShallow: { value: raw(o.shallow !== undefined ? o.shallow : PAL.seaShallow) }, uDeep: { value: raw(o.deep !== undefined ? o.deep : PAL.seaDeep) }, uFoam: { value: raw(PAL.foam) },
    uSkyTop: { value: new THREE.Vector3(sk.top.value.r, sk.top.value.g, sk.top.value.b) }, uSkyBot: { value: new THREE.Vector3(sk.bot.value.r, sk.bot.value.g, sk.bot.value.b) },
    uSunCol: { value: raw(PAL.sun) }, uSun: { value: new THREE.Vector3(...(Wd.sunDir || [-.85, .47, .2])) }, uFogC: { value: new THREE.Vector3(sk.bot.value.r, sk.bot.value.g, sk.bot.value.b) },
    uFogN: { value: fog ? fog.near : 40 }, uFogF: { value: fog ? fog.far : 340 }, uGlint: { value: o.glint === undefined ? 1 : o.glint } };
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG });
  const mesh = new THREE.Mesh(discGeo(o.radius || 700, 96, 144), mat); mesh.frustumCulled = false; mesh.renderOrder = -1; Wd.add(mesh);
  Wd.on((t, cam) => {
    U.uT.value = t; U.uA.value = ampFn(t) / 1.5; if (gust) U.uFront.value = gust.front(t);
    if (o.follow !== false) mesh.position.set(Math.round(cam.position.x / .5) * .5, 0, Math.round(cam.position.z / .5) * .5);
  });
  const S = { mesh, speed, wavelength: lam, k: comps[0].k, dir: [gdx, gdz], ampAt: t => ampFn(t),
    heightAt: (x, z, t) => Y + core(x, z, t).h,
    slopeAt: (x, z, t) => { const q = core(x, z, t); return [q.gx, q.gz]; },
    rideAt: (x, z, t, rmax) => { rmax = rmax === undefined ? .07 : rmax; const q = core(x, z, t), a = Math.min(q.A, rmax), xi = a * Math.sin(q.th0), px = x + xi * gdx, pz = z + xi * gdz, p = core(px, pz, t);
      return { pos: [px, Y + p.h, pz], gx: p.gx, gz: p.gz }; } };
  return S;
}

// ---------------------------------------------------------------- beach
export function beach(Wd, o) {
  o = o || {};
  const slope = o.slope || .1, x0 = o.x0 || 0, z0 = o.z0 === undefined ? -20 : o.z0, z1 = o.z1 === undefined ? 20 : o.z1, xMax = o.xMax || 40, xMin = o.xMin === undefined ? -14 : o.xMin, floor = o.floor === undefined ? -3 : o.floor;
  const hAt = x => Math.max(floor, (x - x0) * slope);
  const NX = 120, NZ = 8, pos = [], cols = [], idx = [], c1 = new THREE.Color(PAL.sand), c2 = new THREE.Color(0xd9bd88), wetX = o.wetX === undefined ? x0 + 6 : o.wetX;
  for (let i = 0; i <= NX; i++) for (let j = 0; j <= NZ; j++) {
    const x = xMin + (xMax - xMin) * Math.pow(i / NX, 1) , z = z0 + (z1 - z0) * j / NZ, y = hAt(x); pos.push(x, y, z);
    const wet = 1 - sstep(x - (wetX - 1.5), 3), c = c1.clone().lerp(c2, Math.max(wet, y < 0 ? .85 : 0)); cols.push(c.r, c.g, c.b); }
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) { const a = i * (NZ + 1) + j, b = a + 1, c = a + NZ + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, toon(0xffffff, { vertexColors: true })); mesh.receiveShadow = true; Wd.add(mesh);
  const B = { mesh, x0, slope, heightAt: hAt };
  // wave tongue: breaks at xBreak, runs up to xMax, loses height, soaks away, remainder slides back.  u = (t-t0)/dur
  B.tongue = tg => {
    const t0 = tg.t0 || 0, dur = tg.dur || 8, xb = tg.xBreak === undefined ? x0 - 1 : tg.xBreak, xm = tg.xMax === undefined ? x0 + 6 : tg.xMax, zA = tg.z0 === undefined ? z0 : tg.z0, zB = tg.z1 === undefined ? z1 : tg.z1, th = tg.thick || .45;
    const N = 40, M = 6, p = new Float32Array((N + 1) * (M + 1) * 3), id = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) { const a = i * (M + 1) + j, b = a + 1, c = a + M + 1, d = c + 1; id.push(a, b, c, b, d, c); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setIndex(id);
    const water = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: PAL.seaShallow, transparent: true, opacity: .82, depthWrite: false })); water.frustumCulled = false; water.renderOrder = 2; Wd.add(water);
    const fg = new THREE.PlaneGeometry(1, 1, 1, 1); fg.rotateX(-Math.PI / 2);
    const foam = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .95, depthWrite: false })); foam.renderOrder = 3; foam.frustumCulled = false; Wd.add(foam);
    const wetM = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: 0x9c7d4e, transparent: true, opacity: 0, depthWrite: false })); wetM.renderOrder = 1; wetM.frustumCulled = false; Wd.add(wetM);
    Wd.on(t => {
      const u = prog(t, t0, t0 + dur), up = ease.out(prog(u, 0, .42)), down = ease.in(prog(u, .62, 1)), front = xb + (xm - xb) * up - (xm - xb) * .85 * down, rear = xb + (xm - xb) * .8 * ease.sm(prog(u, .5, 1));
      const hgt = th * (1 - .85 * prog(u, .3, .7)) * (1 - prog(u, .85, 1)), on = u > 0 && u < 1 && front > rear + .05; water.visible = foam.visible = on;
      const zc = (zA + zB) / 2, hw = (zB - zA) / 2;
      if (on) {
        for (let i = 0; i <= N; i++) { const s = i / N, x = rear + (front - rear) * s, prof = Math.pow(1 - s, 1.4) * hgt + .012;
          for (let j = 0; j <= M; j++) { const z = zA + (zB - zA) * j / M, wob = .08 * Math.sin(z * 1.3 + t * 2) * (1 - s); p.set([x + wob, hAt(x + wob) + prof, z], (i * (M + 1) + j) * 3); } }
        g.attributes.position.needsUpdate = true;
        foam.position.set(front, hAt(front) + .03, zc); foam.scale.set(.5 + .5 * (1 - down), 1, hw * 2);
      }
      wetM.visible = u > .2; wetM.material.opacity = .45 * ease.sm(prog(u, .35, .6)) * (1 - ease.sm(prog(u, .92, 1)) * .6);
      const wx0 = xb, wx1 = xb + (xm - xb) * 1.0; wetM.position.set((wx0 + wx1) / 2, 0, zc); wetM.scale.set(wx1 - wx0, 1, hw * 2);
      wetM.position.y = hAt((wx0 + wx1) / 2) + .004;
    });
    return { front: t => { const u = prog(t, t0, t0 + dur); return xb + (xm - xb) * ease.out(prog(u, 0, .42)) - (xm - xb) * .85 * ease.in(prog(u, .62, 1)); } };
  };
  return B;
}

// ---------------------------------------------------------------- the hero bottle
export function bottle(Wd, o) {
  o = o || {}; const S = o.scale || 1, G = new THREE.Group(), body = new THREE.Group(); G.add(body); G.rotation.order = 'XZY';
  const prof = [[0, -.175], [.04, -.172], [.056, -.15], [.06, -.1], [.06, -.02], [.055, .03], [.036, .075], [.022, .105], [.02, .14], [.024, .152], [.024, .163], [0, .163]].map(p => new THREE.Vector2(p[0], p[1]));
  const glass = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), toon(PAL.red, { transparent: true, opacity: .82, emissive: 0x4a0c08, side: THREE.DoubleSide }));
  glass.castShadow = true; ink(glass, .006, PAL.ink); body.add(glass);
  const inner = new THREE.Mesh(new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p.x * .72, p.y * .86 - .01)), 20), new THREE.MeshBasicMaterial({ color: 0xff8a7a, transparent: true, opacity: .35, depthWrite: false })); body.add(inner);
  const hl = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .75 })); hl.scale.set(.007, .075, .005); hl.position.set(.042, -.045, .036); body.add(hl);
  const hl2 = hl.clone(); hl2.scale.set(.005, .02, .004); hl2.position.set(.03, .06, .027); body.add(hl2);
  const cap = cyl(.029, .031, .04, PAL.gold, { pos: [0, .183, 0], inkW: .005 }); body.add(cap);
  const lip = cyl(.03, .03, .01, 0xd49a2a, { pos: [0, .16, 0], inkW: .004 }); body.add(lip);
  body.rotation.z = -(Math.PI / 2 - .62); G.scale.setScalar(S);
  const sink = o.sink === undefined ? .03 : o.sink; Wd.add(G);
  Wd.on(t => {
    let p, rx = 0, rz = 0;
    if (o.sea) { const at = o.at || [0, 0], r = o.sea.rideAt(at[0], at[1], t); p = r.pos; rz = Math.atan(r.gx); rx = -Math.atan(r.gz); }
    else { const st = o.fn(t); p = st.pos; rx = st.rx || 0; rz = st.rz || 0; }
    G.position.set(p[0], p[1] + sink * S, p[2]); G.rotation.set(rx, o.yaw || 0, rz); body.rotation.x = .07 * Math.sin(t * 1.3 + 1);
  });
  return G;
}
