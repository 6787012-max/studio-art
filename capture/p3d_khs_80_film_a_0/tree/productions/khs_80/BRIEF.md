# BRIEF - khs_80 / film_a: "you cannot want to want" (vertical short, 35.12 s, 1080x1920)

Supervisor: strong model. Builder: ONE Sonnet agent. Output: ONE page `productions/khs_80/film_a.html`, portrait 9:16.
Audience: Jewish adults and teens on a phone. The voice (a rabbi giving a lesson) is mixed LOCALLY later - the render has NO audio.
Captions are rendered by the engine from vault IDs (`CAP_A_01..07`, timing LOCKED in `timeline.json`, `capAt`/`capUntil` local per shot). Zero Hebrew in code.
Read first: `STORYBOARD.md` (the table is the contract), this brief, `timeline.json`, `~/.claude/skills/video-production/references/builder_kit.md`.
Start from the page already here: `productions/khs_80/film_a.html` = a COPY of the finished khs_79 page (portrait setup works). Keep skeleton, imports, portrait settings, no title card, no recap; replace its world, props and shots completely (khs_79 lilac hall, stone, candle, hat, conveyor, arch, dome, columns - none of that stays). Make sure it loads khs_80's timeline (4 shots, 7 captions).

## Owner art direction (hard)
1. 3D with a FLAT, CLEAN explainer look: toon materials, ink outline (kit default), limited palette, clean empty space, smooth motion, gentle camera. No photoreal textures. Bright.
2. OBJECTS FIRST, NO PEOPLE: no character, no faces, no hands (the claw = simple tubes + three prongs).
3. The picture must EXPLAIN what is said at that moment (STORYBOARD column "viewer learns"). Sync key actions to the local times below.
4. Real depth: foreground / midground / background, parallax, soft shadows. Every shot moves; frame 0 of every shot never empty; hero visible within 3 s. Nothing between the camera and the hero action.

## Format (hard)
- Total = 35.12 s exactly (`window.__dur`). Shots: s01 9.55 | s02 9.65 | s03 6.6 | s04 9.32 (trust timeline.json).
- Captions: s01 CAP_A_01 @0, CAP_A_02 @4.35 | s02 CAP_A_03 @0, CAP_A_04 @4.9 | s03 CAP_A_05 @0 | s04 CAP_A_06 @0, CAP_A_07 @4.65.
- Portrait: hero zone y 8%..60%; caption box 64%..80% (engine); bottom 20% calm. Key objects inside x 8%..92%.
- Camera fov 60-75. Never inside geometry.
- CAP_A_05..07 are 14-17 words: make sure the caption box fits them (3 lines / smaller font for those if the kit allows); verify must not flag overflow.
- Last 0.8 s of s04: calm, nothing enters (end card follows elsewhere).

## Look constants (different from the last shorts: NOT lilac hall / conveyor, NOT mint landscape / navy sphere, NOT sky island / puzzle board)
- World: a bright MORNING RIVER VALLEY seen mostly from above (aerial / high three-quarter camera - this camera style is new for the series). Sky gradient pale butter-cream 0xfbf3d9 (top) -> soft peach-white 0xfff8ee (horizon). Ground: rolling SAGE-green banks 0xa9c49a with a few darker olive tufts 0x7f9c6e and round toon trees; low hills far back fading in warm fog.
- RIVER: a wide winding ribbon of deep TEAL water 0x2f8f8f (slightly lighter 0x4fb0aa highlights), flat-shaded, gently scrolling ripple lines. It must have one big three-way FORK (s02) and several smaller forks further downstream (seen in s04 overview). Build it from a curve so the boat can follow it.
- PAPER BOAT (hero): classic folded paper boat, cream 0xfaf3e3 with ink outline, small triangular cream sail that is flat/slack before 7.2 s and filled (curved) after; a tiny rudder at the back that never moves.
- ORB (the will): small glowing golden sphere 0xffc94a with soft additive glow, gentle bob.
- CLAW: grey-blue tubes 0x6f7f99 + three prongs, swoops in from upper right, closes, retracts.
- ARROW LOOP: ring of 5-6 curved coral 0xff8a6b arrow shapes circling the orb.
- CURRENT: glowing pale-gold ripple chevrons/lines on the water pushing behind the boat; WARM BEAM: soft translucent cone of light from upper sky.
- HOUSE: small cube house, cream walls 0xf2e6cf, terracotta roof 0xc8643c, rises from the ground with a soft bounce.
- PUZZLE PIECES: two plain toon pieces (coral 0xff8a6b and teal 0x4fb0aa), soft glow on click.
- LIGHT SOURCE (s04): one big warm golden sun-like soft disc high in the sky; THREADS: thin glowing golden lines down to forks and to the orb.
- No people, no faces, no women, no crosses/churches/mosques/crescents/flags, no letters, numbers, question marks or words on any object, no maps with text, no holy-text object.

## Shots (local times; captions = IDs only)
### s01 (9.55 s) CAP_A_01 @0, CAP_A_02 @4.35
- 0-4.35: frame 0 already shows the golden orb hovering over a small round pedestal on the river bank, the paper boat moored just below it on the water, camera close and slightly low, slow push-in. 0.9 the claw swoops in from upper right and closes on the orb at 1.5 - the orb squeezes out between the prongs (claw closes on air), claw retracts by 2.3. 2.4-4.2 the coral arrow ring appears and circles the orb chasing its own tail (spins, goes nowhere).
- 4.35-9.55: 4.6 arrow ring fades. 5.6 the orb drifts down into the boat. 7.2 on landing: the sail fills (sail shape curves out), the boat starts gliding forward downstream; camera pulls back and rises to follow from behind/above.
### s02 (9.65 s) CAP_A_03 @0, CAP_A_04 @4.9
- 0-4.9: camera tracks beside and above the gliding boat. 0.6 a soft warm beam of light comes down from the upper sky behind the boat; 1.2 glowing pale-gold current chevrons appear on the water behind the boat and push it on (the boat speeds up a little; the rudder stays fixed).
- 4.9-9.65: camera rises to a high 3/4 aerial view: the river splits ahead into a big three-way fork. 6.9 the boat reaches the fork and turns smoothly into the RIGHT branch, carried by the glowing current; 7.8 the other two branches dim slightly. The boat stays clearly visible (it can be a little larger than realistic).
### s03 (6.6 s) CAP_A_05 @0
- 0.4 the current carries the boat to the bank of its branch; 1.3 a small house rises out of the bank beside the boat with a soft bounce; 3.4 the house gives a second small bounce; 4.8 two puzzle pieces float in from left and right above the boat and click together at 5.4 with a soft glow. Camera: gentle orbit around the boat at medium height.
### s04 (9.32 s) CAP_A_06 @0, CAP_A_07 @4.65
- 0-4.65: camera rises high and far: the whole winding river valley with the fork, several smaller forks downstream, a few houses, the boat a small (still visible) speck. 1.7 the boat's travelled path lights golden behind it (a glowing line along the river from the start pedestal to the boat). 3.2 at each fork on the path a soft white ring pulses outward once.
- 4.65-9.32: 4.8 the big warm light disc brightens high in the sky; 4.8-6.0 thin golden threads descend from it to every fork on the lit path; 6.0 the orb in the boat glows and a thread connects it up to the same light. 6.6-9.32 calm hold, very slow drift: light source, threads, golden path. Nothing new after 8.5.

## Process for the builder (hard)
- Do not spawn sub-agents unless essential; then one cheap, well-defined agent.
- Stills (JPG only, never Read a PNG): `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/khs_80/film_a.html productions/khs_80/_stills --times 0.3,1.6,3.3,6.5,8.8,10.8,13,16,18.5,20,21.5,24.8,26.5,28.6,31,32.5,34.8 --fmt jpg --size 540x960 --timeout 900`, then `python tools/safe_view.py productions/khs_80/_stills --out productions/khs_80/_stills_clean --sheet 4` and Read ONLY images it marks CLEAN (if a sheet is BLOCKED, read the single clean stills).
- Numeric gate: `PYTHONIOENCODING=utf-8 python tools/verify_scene.py productions/khs_80/film_a.html --out productions/khs_80/_verify --timeout 900 --cap-min 4.2` must PASS (zero P0/P1). Batch fixes; one full verify; `--shot <id>` for small re-checks. Copy the PASS report to `productions/khs_80/VERIFY_REPORT.json`.
- No video renders. Close every browser/process you opened. Do not leave large temp files.
- Done = film_a.html builds with zero `[STAGE3D_ERROR]`, `__dur` = 35.12, verify PASS copied to root, stills reviewed by you against the STORYBOARD. Report: files, `__dur`, verify result lines, which stills you checked, known defects. Never print Hebrew.
