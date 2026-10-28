# BRIEF - khs_76 / film_a: "what is water, really?" (vertical short, 65.61 s, 1080x1920)

Supervisor: strong model. Builder: ONE Sonnet agent. Output: ONE page `productions/khs_76/film_a.html`, portrait 9:16.
Audience: Jewish adults and teens on a phone. The voice (a rabbi giving a lesson) is mixed LOCALLY later - the render has NO audio.
Captions are rendered by the engine from vault IDs (`CAP_A_01..13`, timing LOCKED in `timeline.json`, `capAt`/`capUntil` local per shot). Zero Hebrew in code.
Read first: `STORYBOARD.md` (the table is the contract), this brief, `timeline.json`, `~/.claude/skills/video-production/references/builder_kit.md`.
Start from the page already here: `productions/khs_76/film_a.html` = a COPY of the finished khs_75 page (portrait setup works: `film({W:1080,H:1920,...})`, fov, caption box). Keep the skeleton, imports, portrait settings, no title card, no recap; replace its world, props and shots completely (khs_75 had a stone shelter, lantern, hail, tap - none of that stays). Make sure the timeline it loads is khs_76's.

## Owner art direction (hard)
1. 3D with a FLAT, CLEAN explainer look: toon materials, ink outline (kit default), limited palette, clean empty space, smooth motion, gentle camera. No photoreal noise or textures. Bright.
2. OBJECTS FIRST, NO PEOPLE: no character at all, no faces. The "person" tokens are smooth rounded capsules on pedestals (pawn-like, no eyes/face/limbs).
3. The picture must EXPLAIN what is said at that moment (STORYBOARD column "what the viewer learns"). Sync key actions to the local times below.
4. Real depth: foreground / midground / background layers (pedestals at different depths), parallax from camera moves, soft shadows. Every shot moves; frame 0 of every shot is never empty; hero object visible within 3 s of each shot.

## Format (hard)
- Total = sum of shots = 65.61 s exactly (`window.__dur`). Shots: s01 10.25 | s02 10.85 | s03 12.0 | s04 10.5 | s05 9.2 | s06 12.81.
- Portrait: hero zone y = 8%..60% of frame height; caption box 64%..80% (engine); bottom 20% calm (floor only). Key objects inside x = 8%..92%.
- Camera fov 60-75 (vertical). Never inside solid geometry (the push into the water drop in s04 must end with the camera outside the drop or the drop must be single-sided/transparent with nothing opaque in front of the lens); no blank start frame.
- Last 1 s of s06: calm, nothing enters (an end card follows, made elsewhere).

## Look constants (different from the last two shorts: NOT lavender, NOT sand/walnut)
- World: a bright airy GALLERY: skyTop/back wall 0xffd9c2 (soft apricot) -> 0xfff4ea (cream) near the floor; floor pale warm grey 0xe9e1d8 with a subtle darker ring grid; 2-3 tall soft columns far back (0xf3c9b0) for depth; fog cream, far ~60. Soft key light from upper left.
- PEDESTALS: short cylinders/boxes deep plum 0x5b3b5c with a cream top cap 0xf5ece0.
- ESSENCE SEED (in every object): small sphere gold 0xf2b33d emissive, slow pulse, inside a tiny clear inner shell. It must read as "deep inside, out of reach".
- CRYSTAL CUBE (s01, s06): frosted ice-blue 0xa9d6e5, opacity ~0.55, rounded edges look; morph in s06 = crossfade/scale between cube, sphere, cone-pyramid.
- MAGNIFIER: ring frame plum 0x5b3b5c + handle, lens disc pale blue opacity 0.25.
- OUTWARD RAYS (s01): 6-8 flat tapered shards in coral 0xf27a5e, teal 0x3fa7a0, mustard 0xe8b04a flying outward from the cube surface toward camera and fading.
- TOKENS (s02): two rounded capsules on pedestals, one coral 0xf27a5e, one teal 0x3fa7a0, each with a thin shimmering outer coat (slightly larger semi-transparent copy) and its own seed. Speech rings = thin torus rings travelling between them. MIRROR = tall rounded rectangle frame plum + silver-blue glass 0xcfe3ea; the reflection: a second token copy behind the glass WITHOUT a seed (a dark small spot instead).
- WATER DROP (s03-s05): big teardrop/sphere ocean blue 0x2f8fc9, opacity ~0.6, glossy toon; seed inside. Steam = soft white curling puffs; stream = a blue ribbon/tube arc into a shallow cream bowl; ice cube = small pale cube; ripple rings = thin tori.
- GOLDEN THREADS (s04): thin glowing gold lines (tubes) from each seed straight up out of frame; LIGHT ABOVE = a soft warm white-gold glow plane/sprite at the top of the frame, no shape, no figure, no symbol.
- TOOLS (s05-s06): big ruler (cream with plum tick marks, NO numbers/letters), balance scale (mustard), thermometer (glass tube + coral bulb), stopwatch (teal disc + needle), gears (mustard/teal) that mesh and turn. Blueprint: pale blue grid plane on the floor; building blocks cream/plum/teal stacking into a small bridge + tower; a simple crane (box arm).
- No people, no faces, no women, no crosses/churches/mosques, no letters, numbers or words on any object, no holy-text object.

## Shots (local times; captions = IDs only)
### s01 (10.25 s) CAP_A_01 @0, CAP_A_02 @4.8 - "no essence grasped; only the outside; even you"
- 0-1.0: gallery mid shot, cube on pedestal centre, seed faintly glowing inside; dolly-in starts.
- 1.0-4.5: magnifier glides in from the right and hovers over the cube; lens sweeps across the faces; the seed stays blurred/dim behind the frost.
- 4.8-7.0: magnifier moves away; colored rays burst outward from the surface toward camera in 3 small waves; the seed does not move.
- 7.2-10.25: camera pans right/forward to the coral token on its pedestal (seed inside) and the teal token beyond it.
### s02 (10.85 s) CAP_A_03 @0, CAP_A_04 @5.15 - "talking and looking reach the outside; not even myself"
- 0-5.0: two tokens face each other; speech rings pulse from coral to teal and back (every ~0.8 s); each ring hits the outer coat and spreads over it like a ripple; seeds untouched. Slow orbit.
- 5.15-6.5: coral token turns (rotates) to face a tall mirror on the left.
- 6.5-10.85: camera over its shoulder pushes toward the mirror: the reflection shows the coat but the reflected seed spot is dark/empty; the real seed glows.
### s03 (12.0 s) CAP_A_05 @0, CAP_A_06 @5.3 - "water: why is it like this? its phenomena"
- 0-5.3: huge water drop hovering over a pedestal, seed inside, slow rotation; 3 empty thin rings orbit it.
- 7.2: steam puffs curl up off its top.
- 8.0-9.5: a blue stream pours from the drop into a bowl and loops back up.
- 9.6-12.0: an ice cube and ripple rings orbit it like toys; camera circles; the seed never changes.
### s04 (10.5 s) CAP_A_07 @0, CAP_A_08 @4.8 - "what is it really? from His will - beyond grasp"
- 0-2.3: phenomena fade; camera pushes toward the seed in the drop.
- 2.3-4.8: camera tilts up; a golden thread starts rising from the seed.
- 4.8-7.4: thread rises out of the drop up into a soft light at the top of frame; camera rises with it.
- 7.4-10.5: wide reveal: cube, both tokens, the drop - each with a thread rising into the same light. The magnifier floats up along one thread and fades out halfway.
### s05 (9.2 s) CAP_A_09 @0, CAP_A_10 @4.4 - "only the outside; the scientist's measurements"
- 0-4.4: camera descends; threads dim; shells glow; tools rise from the floor around the drop (ruler, scale, thermometer, stopwatch, gears).
- 4.4-9.2: tools measure: ruler slides beside the drop, scale pans tilt, thermometer fluid rises, stopwatch needle spins; each tool touching the shell gives a small spark and stops at the surface.
### s06 (12.81 s) CAP_A_11 @0, CAP_A_12 @4.5, CAP_A_13 @8.75 - "how, not why; engineering; why this shape"
- 0-4.5: gears assemble into a smooth turning machine beside the drop; a dim cone of light tries to shine into the seed and bounces off.
- 4.5-8.75: blueprint grid spreads on the floor; blocks stack into a bridge and a tower in quick steps; a simple crane swings; camera pulls back wide.
- 8.75-11.8: back on the crystal: it morphs cube -> sphere -> pyramid -> cube (each ~0.8 s), seed glowing warmly, untouched.
- 11.8-12.81: calm hold, gentle drift.

## Process for the builder (hard)
- Do not spawn sub-agents unless essential; then one cheap, well-defined agent.
- Stills (JPG only, never Read a PNG): `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/khs_76/film_a.html productions/khs_76/_stills --times 2.5,6,9,13,19,24,30,35,41,46,50,55,60,64 --fmt jpg --size 540x960 --timeout 900`, then `python tools/safe_view.py productions/khs_76/_stills --out productions/khs_76/_stills_clean --sheet 4` and Read ONLY images it marks CLEAN.
- Numeric gate: `PYTHONIOENCODING=utf-8 python tools/verify_scene.py productions/khs_76/film_a.html --out productions/khs_76/_verify --timeout 900 --cap-min 3.6` must PASS (zero P0/P1). Batch fixes; one full verify; `--shot <id>` for small re-checks. Copy the PASS report to `productions/khs_76/VERIFY_REPORT.json`.
- No video renders. Close every browser/process you opened.
- Done = film_a.html builds with zero `[STAGE3D_ERROR]`, `__dur` = 65.61, verify PASS copied to the root, stills reviewed by you against the STORYBOARD. Report: files, `__dur`, verify result lines, which stills you checked, known defects. Never print Hebrew.
