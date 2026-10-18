# Lesson 6 in 3D: brief for each film builder

Audience: Haredi boys, about 6th grade. The film is shown in class on a projector, with music and no narration;
the captions are the explanation. The teacher (Yosef) asked for: everything in 3D with depth, a camera that flies,
hovers and circles 360°, characters drawn in code that are professional and connected (one outline per body),
and many kinds of movement (not only raising hands).

## Files and running
- Engine: `C:/projects/_studio-animatzia/lib/stage3d.js` (read all of it before you start, it is short).
- Characters: `C:/projects/_studio-animatzia/lib/people_pro.js` (read the comment at the top: all parameters and gestures).
- Working example: `C:/projects/_studio-animatzia/productions/toldot06/test3d.html` — copy its head exactly
  (classic scripts people_pro.js and geo_eretz.js, an importmap for three, then `<script type="module">`).
- Your output: `C:/projects/_studio-animatzia/productions/toldot06/<film_id>.html` (one file per film, all shots inside it).
- Stills for checking (local CPU, about one minute):
  `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/toldot06/<film_id>.html <outdir> --times 3,10,... --sheet <outdir>/sheet.png --cols 4 --timeout 600`
  Then look at the sheet AND at least 3 full-size stills with the Read tool. Fix and re-render until it is genuinely good.
  Use a scratch directory for stills (for example `C:/projects/_studio-animatzia/productions/toldot06/_stills/<film_id>`).
- Do not render video. The final render runs on a remote server afterwards.

## Engine in brief
`film({title, kicker, recap:[...], shots:[{dur, caps:[...], capAt?:[...], build(){...}}]})`
- `title` = the film title (shown as a corner tag); `kicker` = e.g. 'סרטון 2' (with title it makes an opening card of the first 4 seconds; omit it for the hook);
  `recap` = the 3 summary lines (a 9-second end card "מה למדנו?").
- Each `build()` creates `const Wd = world({...})`, adds objects, and returns `Object.assign(Wd, {cam: <function t -> {pos, look, fov}>, update?(t)})`.
  t is the time inside the shot in seconds. Everything must be a function of t only (no Math.random, no Date; use `rng(seed)`).
- Captions are spread evenly across the shot, or by `capAt` (the start second of each caption). Each caption needs at least 5 seconds.
  The captions must be EXACTLY the texts given below, in that order, without changing a word.
- `world({ground:'grass'|'sand'|'dry'|'stone'|'paper'|'asphalt'|'dark', skyTop, skyBottom, fogColor, fogNear, fogFar, sun, sunPos, hemi, shadowExt})`
- Objects: `box(w,h,d,color,{pos,rot,scale})`, `cyl(rTop,rBot,h,color,{...})`, `ball(r,color,{...})` (toon shading + ink outline built in),
  `toon(color)` material, `ink(mesh,w)` outline, `canvasTex(w,h,draw)`, `groundTex(kind)`,
  `cloud({seed,size,color,pos,puffs})`, `rain(Wd,{x0,x1,z0,z1,top,bottom,count,speed,amount:t=>0..1,offset:t=>[dx,dz]})`,
  `label(Wd,'טקסט',{pos:[x,y,z],height,color,bg})` (Hebrew label in the world, always facing the camera),
  `map3d({scale,exag,mode:'rain'})` -> `{group, at(lon,lat,lift) -> Vector3, X(lon), Z(lat), setMode('rain')}`, `CITIES` (Hebrew names -> [lon,lat]),
  `person(Wd, LOOK, t => ({pos:[x,0,z], facing:<radians, 0 = toward +z>, gesture, perform, talk, walk, stride, ...}), {res, scale})`.
  `Wd.on(t => {...})` = an update function per frame; `Wd.add(obj)`.
- Camera: `path([[t,[x,y,z],[lookX,lookY,lookZ],fov], ...])` = a smooth flight between points; `orbit(center,r,h,a0,a1,t0,t1,fov)` = circling (degrees);
  `seq([0,f1],[t1,f2])` = switching between camera moves inside a shot.
- Units: meters, y up. A person is 1.75 m tall. On map3d: north = -z, east = +x; with scale .5 the whole country is about 20 m long.
- Use the full three.js (THREE is exported) for anything else: house, wall, water (a semi-transparent plane), rising water level (scale.y), particles, etc.

## Characters
- The teacher (main guide, appears in most shots): `const RAV = {coat:'#1d1d24', beard:'#3a2a20', beardLen:.6, hat:'hat', skin:'#efcfb0', glasses:true}`
- Boys (students): `{coat:'#2b3a5a', hat:'kippa', hatColor:'#101014', beardLen:0, skin:'#f0d2b4', pants:'#1b1d24'}` at `{scale:.72}` (in the 4th argument of person).
- Men only. No women and no girls at all. Modest clothing. No crosses, no churches, no mosques.
- Movements: `gesture` from: explain, explainA, point, pointA, pointFwd, finger, heart, wave, wide, think, thumb, pray, shrug, hips, cross, stop, count, offer, bless, up.
  `perform: .8` = he changes gestures by himself while talking; `talk: 0..1` = mouth (for example .5+.5*Math.sin(t*9) while "speaking");
  walking: `walk: t*5, stride: .8` together with moving pos; `facing` = the direction he looks; `nod`, `tilt`, `brow`, `smile`, `look`.
  The figure turns by itself according to the camera angle (front / side / back). Make use of this: walk, turn, point at things.

## Quality bar (this is what Yosef will judge)
- Every shot is a real 3D place with depth, not a flat board. The camera moves all the time and smoothly: flight, circling, descending, approaching.
  At least one striking camera move per shot (a 360° orbit, a dive from the sky, a fly-through between clouds, going down into the ground, etc.).
- The picture explains the caption that is on screen right now. Something meaningful changes with every caption (water rising, a column growing, a cloud moving).
- Not empty and not crowded. Warm, bright colours (a classroom picture, not a dark night). Big things, clearly readable.
- Do not put text inside the picture other than short labels (city names, numbers, months). The explanation is in the captions.
- Hebrew in labels: write numbers as in the captions.
- Check the stills critically: is something hidden behind a caption? A camera inside an object? A character floating in the air or sinking into the ground? Fix it.

## When you finish
Report: the file path, the total length in seconds, a list of the shots with their duration and the camera move in each, and what you still don't like.
