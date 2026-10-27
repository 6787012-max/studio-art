# BRIEF - khs_75 / film_a: "exile of the body, exile of the mind" (vertical short, 59.99 s, 1080x1920)

Supervisor: strong model. Builder: ONE Sonnet agent. Output: ONE page `productions/khs_75/film_a.html`, portrait 9:16.
Audience: Jewish adults and teens on a phone. The voice (a rabbi giving a lesson) is mixed LOCALLY later - the render has NO audio.
Captions are rendered by the engine from vault IDs (`CAP_A_01..11`, timing LOCKED in `timeline.json`, `capAt`/`capUntil` local per shot). Zero Hebrew in code.
Read first: `STORYBOARD.md` (the table is the contract), this brief, `timeline.json`, `~/.claude/skills/video-production/references/builder_kit.md`.
Start from the page already here: `productions/khs_75/film_a.html` = a COPY of the finished khs_74 page (portrait setup works: `film({W:1080,H:1920,...})`, fov handling, caption box). Keep the skeleton, imports, portrait settings, no title card, no recap; replace its world, props and shots completely (khs_74 had a workbench/grid/orb - none of that stays). Make sure the timeline it loads is khs_75's.

## Owner art direction (hard)
1. 3D with a FLAT, CLEAN explainer look: toon materials, ink outline (kit default), limited palette, clean empty space around hero objects, smooth motion, gentle camera. No photoreal noise or textures. Bright and soft even at "night" (night = deeper lavender, never black).
2. OBJECTS FIRST, NO PEOPLE: no character at all. Ideas are acted out by objects: tree, leaves, cloud, rain, bud, stone shelter, lantern, flame, compass needle, hail, cracks, drops, tap, bowl, mist, arrows.
3. The picture must EXPLAIN what is said at that moment (STORYBOARD column "what the viewer learns"). Sync key actions to the local times below.
4. Real depth: foreground / midground / background layers, parallax from camera moves, soft shadows. Every shot moves; frame 0 of every shot is never empty; hero object visible within 3 s of each shot.

## Format (hard)
- Total = sum of shots = 59.99 s exactly (`window.__dur`). Shots: s01 10.5 | s02 10.9 | s03 11.3 | s04 10.2 | s05 9.5 | s06 7.59.
- Portrait: hero zone y = 8%..60% of frame height; caption box 64%..80% (engine); bottom 20% calm (floor only). Key objects inside x = 8%..92%.
- Camera fov 60-75 (vertical). Never inside geometry (the push-in through the crack ends INSIDE the hollow shelter, which must be open/hollow with no faces in front of the lens); no blank start frame.
- Last 1 s of s06: calm, nothing enters (an end card follows, made elsewhere).

## Look constants
- World: skyTop 0xcdbfe0, skyBottom 0xf3eef6, floor/meadow 0xe2dbd0 with a ring of pale sage grass 0xb9cfa8, soft sun from upper left, fog pale lavender, far ~60. Night (s04 from 4.75 to s05 start): lerp sky to skyTop 0x8f7fb0 / skyBottom 0xd6cce6 + a pale moon disc 0xf6f0dc; back to dusk in s05.
- STONE SHELTER: round, ~1.6 m wide, 1.3 m high: a cylinder wall (warm stone 0xc9b8a3) with a low dome roof and an arched DOORWAY facing camera; HOLLOW inside. Crack lines = thin dark 0x6b5a4c boxes/planes appearing on the wall; frost = small white-blue 0xdfe9f5 flat crystals; dents = small darker discs. In s04-s05 cracks/dents fade out (healed) and the stone gets a soft glossy highlight + 3-4 soft cushions/flowers (rose 0xe9a3a8, mint) around the base.
- LANTERN (the mind): on a short stone pedestal inside the shelter centre: glass cylinder (opacity 0.3) with a gold 0xe8a92a cap/base; inside a FLAME (2-3 stacked cones/teardrop, gold->warm white emissive, gentle flicker) and a slim COMPASS NEEDLE (gold flat diamond) on a pivot above the flame, pointing straight UP when clear. Mist = 6-10 soft pale-grey 0xd9d4de spheres with low opacity growing inside the glass.
- AUTUMN TREE: trunk walnut 0x6e4b36, round canopy clusters burgundy 0x9c3b47 + mustard; falling leaves = small flat diamonds drifting/rotating.
- RAIN CLOUD: 5-7 merged slate-blue 0x5d7290 / lighter 0x8a9bb5 spheres; rain = thin falling streaks; DROPS = slate teardrops; ripple = thin torus scaling up and fading.
- BUD: mint 0x7fcfa8 stem + 2 leaves + a small closed bud that opens (petals rose 0xe9a3a8).
- HAIL: burgundy 0x9c3b47 small spheres falling fast, bouncing off the shelter. HAIL CLOUD (s03): dark grey 0x4a4550 angular low-poly cluster that shrinks and fades to nothing.
- TAP (s04): slate/brass 0xb08d57 pipe + spout above a shallow metal bowl 0x9aa4b0 standing beside the shelter.
- FLOOR ARROWS (s06): 5 flat arrow shapes (box shaft + cone/triangle head) in mustard/slate/rose/mint/burgundy pointing in different directions around the lantern, each lights up (emissive) in turn.
- Cold wind (s01): 6-10 thin pale-blue curved streaks sliding across.
- No people, no women, no crosses/churches/mosques, no letters or words on objects, no holy text object.

## Shots (local times; captions = IDs only)
### s01 (10.5 s) CAP_A_01 @0, CAP_A_02 @5.2 - "autumn, rain, buds; autumn = cold"
- 0-1.5: low wide shot, autumn tree left, shelter right-back; leaves fall; slow tracking left->right.
- 1.5-3.0: rain cloud passes over, rains briefly, drifts off.
- 3.2-4.8: mint bud rises from the ground near camera and opens.
- 5.2-5.6: camera eases toward the shelter (lantern glow visible through the doorway).
- 5.5-9.0: cold wind streaks blow across; frost crystals grow on the shelter wall; the bud bends/shivers.
- 9.0-10.5: hold, frost covers the outer wall.
### s02 (10.9 s) CAP_A_03 @0, CAP_A_04 @5.8 - "blows on the body - mind whole"
- 0-0.5: low close shot of the frosted shelter wall.
- 0.5-5.8: hail pelts the shelter (bounces), dents and 4-6 cracks spread step by step (one per ~0.8 s); tiny camera shake on bigger hits.
- 5.8-8.3: hail keeps falling; camera lines up with one big crack.
- 8.4-9.3: push-in through the crack into the hollow shelter.
- 9.3-10.9: inside: flame tall and steady, needle pointing straight up, perfectly still; the hail sound-less flashes outside the crack.
### s03 (11.3 s) CAP_A_05 @0, CAP_A_06 @5.4 - "I know who I am; the attacker becomes nothing"
- 0-0.5: pull back out of the shelter to a side view: lantern (now outside the doorway on its pedestal, or seen through a cut-away of the shelter) on the right, dark angular hail cloud low on the left.
- 0.5-2.5: a clear glowing gold line draws itself on the floor between them.
- 2.5-5.4: hold; the needle points up, steady.
- 5.6-7.2: three hailstones fly from the cloud and hit the shelter; at each hit the flame grows taller/brighter and the cloud shrinks and greys.
- 7.3: the cloud dissolves to nothing (fade + scale to 0).
- 7.9-11.3: calm, sky lightens; a soft slate rain cloud drifts in slowly from the top.
### s04 (10.2 s) CAP_A_07 @0, CAP_A_08 @4.75 - "the rain drips; the tap drives the mind mad"
- 0-1.5: under the rain cloud a drop forms and falls onto the shelter roof; ripple at 1.5.
- 3.0, 4.2: second and third drops with ripples. The cracks on the shelter fade out (healed).
- 4.75-5.6: sky goes to night lavender, moon appears; camera slides to the TAP and bowl beside the shelter.
- 5.6-10.2: drip... drip... (every ~0.9 s, accelerating to ~0.5 s); each drip makes a ring in the bowl; through the doorway the needle twitches at each drip.
### s05 (9.5 s) CAP_A_09 @0, CAP_A_10 @4.6 - "exile of the mind: comfort outside, confusion inside"
- 0-1.0: dusk returns; the shelter is whole, glossy, with cushions/flowers around: comfortable.
- 1.0-4.6: camera pushes toward the lantern through the doorway; mist begins inside the glass; flame flickers.
- 4.8-6.6: short reveal of the comfortable shelter again (no hail anywhere).
- 7.0-9.5: needle starts spinning; mist thickens, flame dims.
### s06 (7.59 s) CAP_A_11 @0 - "who are we? what is our role?"
- 0-1.5: top-down view over the courtyard, slow rotation; lantern at the centre, needle spinning.
- 1.5-4.5: 5 floor arrows around it light up one after another; the needle wobbles toward each and swings away.
- 5.6: one last drip falls into the bowl (ring).
- 6.6-7.59: calm hold.

## Process for the builder (hard)
- Do not spawn sub-agents unless essential; then one cheap, well-defined agent.
- Stills (JPG only, never Read a PNG): `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/khs_75/film_a.html productions/khs_75/_stills --times 2,4.5,8,13,20,24,28.5,34,39.5,45,51,54.5,58.5 --fmt jpg --size 540x960 --timeout 900`, then `python tools/safe_view.py productions/khs_75/_stills --out productions/khs_75/_stills_clean --sheet 4` and Read ONLY images it marks CLEAN.
- Numeric gate: `PYTHONIOENCODING=utf-8 python tools/verify_scene.py productions/khs_75/film_a.html --out productions/khs_75/_verify --timeout 900 --cap-min 4.2` must PASS (zero P0/P1). Batch fixes; one full verify; `--shot <id>` for small re-checks. Copy the PASS report to `productions/khs_75/VERIFY_REPORT.json`.
- No video renders. Close every browser/process you opened.
- Done = film_a.html builds with zero `[STAGE3D_ERROR]`, `__dur` = 59.99, verify PASS copied to the root, stills reviewed by you against the STORYBOARD. Report: files, `__dur`, verify result lines, which stills you checked, known defects. Never print Hebrew.
