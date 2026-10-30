# BRIEF - khs_79 / film_a: "the festival that cannot be distorted" (vertical short, 36.45 s, 1080x1920)

Supervisor: strong model. Builder: ONE Sonnet agent. Output: ONE page `productions/khs_79/film_a.html`, portrait 9:16.
Audience: Jewish adults and teens on a phone. The voice (a rabbi giving a lesson) is mixed LOCALLY later - the render has NO audio.
Captions are rendered by the engine from vault IDs (`CAP_A_01..08`, timing LOCKED in `timeline.json`, `capAt`/`capUntil` local per shot). Zero Hebrew in code.
Read first: `STORYBOARD.md` (the table is the contract), this brief, `timeline.json`, `~/.claude/skills/video-production/references/builder_kit.md`.
Start from the page already here: `productions/khs_79/film_a.html` = a COPY of the finished khs_78 page (portrait setup works). Keep skeleton, imports, portrait settings, no title card, no recap; replace its world, props and shots completely (khs_78 mint landscape, pedestal, navy sphere, spring, blocks, pendulum, beads - none of that stays). Make sure it loads khs_79's timeline (4 shots, 8 captions).

## Owner art direction (hard)
1. 3D with a FLAT, CLEAN explainer look: toon materials, ink outline (kit default), limited palette, clean empty space, smooth motion, gentle camera. No photoreal textures. Bright.
2. OBJECTS FIRST, NO PEOPLE: no character, no faces, no hands (a robotic arm = simple tubes and a clamp, not a hand).
3. The picture must EXPLAIN what is said at that moment (STORYBOARD column "viewer learns"). Sync key actions to the local times below.
4. Real depth: foreground / midground / background, parallax, soft shadows. Every shot moves; frame 0 of every shot never empty; hero visible within 3 s.

## Format (hard)
- Total = 36.45 s exactly (`window.__dur`). Shots: s01 8.79 | s02 9.11 | s03 9.10 | s04 9.45 (trust timeline.json).
- Captions: s01 CAP_A_01 @0, CAP_A_02 @4.35 | s02 CAP_A_03 @0, CAP_A_04 @4.51 | s03 CAP_A_05 @0, CAP_A_06 @4.6 | s04 CAP_A_07 @0, CAP_A_08 @4.75.
- Portrait: hero zone y 8%..60%; caption box 64%..80% (engine); bottom 20% calm. Key objects inside x 8%..92%.
- Camera fov 60-75. Never inside geometry.
- CAP_A_07 is 17 words and CAP_A_08 14 words: make sure the caption box fits them (3 lines / smaller font for those if the kit allows); verify must not flag overflow.
- Last 0.8 s of s04: calm, nothing enters (end card follows elsewhere).

## Look constants (different from the last shorts: NOT mint landscape / navy sphere, NOT sky island / puzzle, NOT apricot gallery)
- World: clean soft LILAC-GREY hall / open studio. Background gradient 0xdcd6ea (top) -> 0xf3f0f8 (horizon). Floor: wide pale lavender-white 0xeeeaf4, faint large tiles. Fog pale lilac far ~60. Key light upper right, warm; soft shadows.
- STONE (hero, Tisha b'Av): low rough-ish but flat-shaded block, dark slate 0x4a4f5c, about knee height relative to the conveyor; ONE small candle on it: cream wax cylinder 0xf4ead2 + ochre/amber flame (additive glow 0xffb347) with a gentle flicker and a soft warm point light.
- HAT: classic black brimmed hat (flat wide brim + rounded crown, 0x1b1b1f, thin dark band) resting on the stone beside the candle. No person under it.
- CONVEYOR: long belt (slate-blue 0x5b6b8c with light rollers) running across the midground; REPAINT ARCH = coral 0xff7a7a / turquoise 0x3cc6c0 gateway with a glowing ring inside, small nozzles puffing pastel mist.
- Festival objects BEFORE the arch (calm natural colours): stack of 5 round flat matzah discs (pale wheat 0xe8d3a3 with a few darker dots), golden wheat sheaf 0xd9a93a, a small hut with a leafy green top, a plain silver cup. AFTER the arch (garish, toy-like): candy-pink/turquoise striped spinning disc stack, shiny green toy tractor (simple boxes + wheels), the hut bent and neon, the cup stretched and recoloured.
- ROBOT ARM: coral tubes + simple two-prong clamp from the arch. SCAN RING: thin turquoise torus that shatters into small shards + sparks.
- COVER DOME: big glossy pastel (pink-lilac) half-sphere, slightly translucent.
- EXILE: dark crack line spreading across the floor from the stone; far background 4-6 broken column stumps (white stone, flat-shaded) rising out of the floor.
- DISSOLVE: shiny objects fade to transparent + break into drifting small dust particles.
- No people, no faces, no women, no crosses/churches/mosques/crescents/flags, no letters, numbers or words on any object, no maps, no holy-text object, no scroll.

## Shots (local times; captions = IDs only)
### s01 (8.79 s) CAP_A_01 @0, CAP_A_02 @4.35
- 0-4.3: frame 0 already shows the dark stone with the lit candle, camera low, slow push-in. 2.4 flame brightens. 3.5 the black hat drops gently onto the stone beside the candle (small settle bounce).
- 4.4-8.79: camera rises and pulls back over the stone: behind it the conveyor belt and the repaint arch come into view with the natural-coloured objects waiting on the belt. 7.3 the arch ring lights up and pulses.
### s02 (9.11 s) CAP_A_03 @0, CAP_A_04 @4.51
- Side tracking camera along the belt, arch in the centre of frame; the stone stays visible small at the frame edge or far foreground.
- 1.2 belt starts moving. 2.2 matzah stack enters the arch, 3.0 exits candy-striped and spinning like a toy. 5.3 wheat sheaf enters, 6.0 exits as a shiny green toy tractor. 6.5-9.0 the hut and the cup go through and come out bent/neon; mist puffs each time.
### s03 (9.10 s) CAP_A_05 @0, CAP_A_06 @4.6
- 0.5 the coral robot arm swings out of the arch toward the stone; 2.7 a turquoise scan ring descends over the stone; 3.6-3.9 on contact the ring SHATTERS (shards + sparks), the arm recoils back. 5.1 the arch sputters (ring flickers, mist stops).
- 5.8-9.1: camera comes down low and close to the stone: warm candle light, the hat, the rough stone; the machine and toys behind go soft (fog/dim).
### s04 (9.45 s) CAP_A_07 @0, CAP_A_08 @4.75
- 1.3-3.6: the big glossy pastel dome lowers from above over the stone, almost closing.
- 4.6: the flame flares; the dome lifts and slides away out of frame. 5.3 flame steady and strong.
- 6.3: a dark crack runs across the floor from the stone; far background broken column stumps rise into view.
- 7.5-8.7: the conveyor, the toys, the arch and the dome turn translucent and dissolve into drifting dust.
- 8.7-9.45: calm hold: stone, flame, hat, crack, far broken columns.

## Process for the builder (hard)
- Do not spawn sub-agents unless essential; then one cheap, well-defined agent.
- Stills (JPG only, never Read a PNG): `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/khs_79/film_a.html productions/khs_79/_stills --times 0.3,3,6,8.5,10,12.5,15.5,19,21.7,24.5,26.5,28.5,32,34.5,36.2 --fmt jpg --size 540x960 --timeout 900`, then `python tools/safe_view.py productions/khs_79/_stills --out productions/khs_79/_stills_clean --sheet 4` and Read ONLY images it marks CLEAN (if a sheet is BLOCKED, read the single clean stills).
- Numeric gate: `PYTHONIOENCODING=utf-8 python tools/verify_scene.py productions/khs_79/film_a.html --out productions/khs_79/_verify --timeout 900 --cap-min 4.2` must PASS (zero P0/P1). Batch fixes; one full verify; `--shot <id>` for small re-checks. Copy the PASS report to `productions/khs_79/VERIFY_REPORT.json`.
- No video renders. Close every browser/process you opened. Do not leave large temp files.
- Done = film_a.html builds with zero `[STAGE3D_ERROR]`, `__dur` = 36.45, verify PASS copied to root, stills reviewed by you against the STORYBOARD. Report: files, `__dur`, verify result lines, which stills you checked, known defects. Never print Hebrew.
