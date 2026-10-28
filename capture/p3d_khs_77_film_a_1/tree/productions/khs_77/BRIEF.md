# BRIEF - khs_77 / film_a: "everything is one whole picture" (vertical short, 58.78 s, 1080x1920)

Supervisor: strong model. Builder: ONE Sonnet agent. Output: ONE page `productions/khs_77/film_a.html`, portrait 9:16.
Audience: Jewish adults and teens on a phone. The voice (a rabbi giving a lesson) is mixed LOCALLY later - the render has NO audio.
Captions are rendered by the engine from vault IDs (`CAP_A_01..12`, timing LOCKED in `timeline.json`, `capAt`/`capUntil` local per shot). Zero Hebrew in code.
Read first: `STORYBOARD.md` (the table is the contract), this brief, `timeline.json`, `~/.claude/skills/video-production/references/builder_kit.md`.
Start from the page already here: `productions/khs_77/film_a.html` = a COPY of the finished khs_76 page (portrait setup works). Keep skeleton, imports, portrait settings, no title card, no recap; replace its world, props and shots completely (khs_76 gallery, pedestals, water drop, tools - none of that stays). Make sure it loads khs_77's timeline.

## Owner art direction (hard)
1. 3D with a FLAT, CLEAN explainer look: toon materials, ink outline (kit default), limited palette, clean empty space, smooth motion, gentle camera. No photoreal textures. Bright.
2. OBJECTS FIRST, NO PEOPLE: no character, no faces, no hands.
3. The picture must EXPLAIN what is said at that moment (STORYBOARD column "viewer learns"). Sync key actions to the local times below.
4. Real depth: foreground / midground / background (far soft clouds, floating pieces at different depths), parallax, soft shadows. Every shot moves; frame 0 of every shot never empty; hero visible within 3 s.

## Format (hard)
- Total = 58.78 s exactly (`window.__dur`). Shots: s01 10.4 | s02 9.55 | s03 9.05 | s04 9.6 | s05 8.9 | s06 11.28.
- Portrait: hero zone y 8%..60%; caption box 64%..80% (engine); bottom 20% calm. Key objects inside x 8%..92%.
- Camera fov 60-75. Never inside geometry (the dive into the car piece in s04 is a camera move toward a small diorama, ending above it, not through solids).
- CAP_A_12 is a long caption (19 words): make sure the engine caption box fits it (smaller caption font for that one if the kit allows, or 3 lines); verify must not flag overflow.
- Last 1 s of s06: calm, nothing enters (end card follows elsewhere).

## Look constants (different from the last two shorts: NOT apricot gallery/plum, NOT lavender/stone)
- World: airy SKY ISLAND. Sky gradient 0xbfe3f5 (top) -> 0xf3fbff (horizon). A wide round meadow plateau (flat disc) 0x9fd39a with a cream rim 0xfaf3e3, floating; a few far soft flattened white clouds for depth; fog pale blue far ~70. Key light upper left, soft shadows.
- PUZZLE PIECES: thick rounded flat tiles (simple square tiles with one round knob/notch look - or plain rounded squares if knobs are too costly) in cream 0xfaf3e3, leaf green 0x6fb36a, forest green 0x2f6b4f, coral 0xf2785c, sky teal 0x3fa7a0. The assembled picture: ~7x7 grid lying flat on the plateau, colours arranged as a simple abstract landscape (green bands, teal band, cream), centre tile gold 0xf2b33d.
- CROWN: simple gold crown (cylinder ring + 5 points with small balls), emissive gold, gentle bob; three thin gold rings (tori) around it at heights, each lights on cue.
- CLOCK (s02): flat cream disc with forest-green tick marks only (NO numbers) and a coral hand.
- CREATURE TOKENS (s03): grey rounded stone; small green sapling (cone/spheres); a simple bird shape (rounded body + wing plates, no face detail) or fish; a cream speech-bubble shape; four elements: orange-coral flame (stacked cones), blue water drop, white air swirl (torus arcs), brown earth clod.
- GOLD LINKS / THREADS: thin glowing gold tubes.
- TOY ROAD SCENE (s04): one enlarged tile = mini diorama: grey road strip, toy car (coral box body, teal cabin, black wheels), a round sign on a pole (white disc, red rim, NOTHING written), a post with a small blue/red alternating light, a plain white paper slip (no text) that drops onto the windshield.
- VEIL (s06): soft cream cloud puff covering one tile; outline of that tile glows gold through it. LANTERN: small forest-green lantern with warm steady flame.
- DEPTH (s06): 2-3 fainter copies of the picture stacked below the plateau (transparent), revealed as the camera tilts down.
- No people, no faces, no women, no crosses/churches/mosques, no letters, numbers or words on any object, no holy-text object.

## Shots (local times; captions = IDs only)
### s01 (10.4 s) CAP_A_01 @0, CAP_A_02 @4.6
- 0-1.0: pieces scattered in the sky above the plateau, drifting/rotating; camera low-wide.
- 1.0-3.6: pieces fly in on curved paths and lock into the 7x7 picture on the plateau (staggered, satisfying snap); camera cranes up to a high 3/4 view.
- 4.8: crown rises from the gold centre tile. 6.1, 7.8, 8.8: ring 1, 2, 3 light; each sends a light wave across the picture. Slow orbit to 10.4.
### s02 (9.55 s) CAP_A_03 @0, CAP_A_04 @4.9
- 0-5.1: clock dial floats beside the crown; from 2.9, every 0.8 s the hand ticks and a pulse travels crown -> picture.
- 5.1-7.0: camera pulls back/up; every tile shows a small inner gold glow.
- 6.9-7.8: all tiles flash the same gold together.
- 8.9-9.55: small objects start rising out of tiles (preview of s03).
### s03 (9.05 s) CAP_A_05 @0, CAP_A_06 @4.65
- 1.2 stone, 1.6 sapling, 2.0 bird, 2.3 speech bubble rise from tiles; 2.8-3.2 flame, water drop, air swirl, earth clod rise.
- 3.9 onward: each emits a gold pulse every ~1 s.
- 7.6-8.8: gold links connect them in sequence into a chain. Camera arcs around them.
### s04 (9.6 s) CAP_A_07 @0, CAP_A_08 @4.4
- 0.7-1.3: chain closes into a ring.
- 1.5-4.0: camera glides down toward ONE tile which grows into the toy road diorama.
- 4.5 paper slip drops on the windshield; 6.4 car zips past the sign; 7.1 light post flashes blue/red.
- 8.6-9.6: fast zoom out; diorama shrinks to a speck in the big picture.
### s05 (8.9 s) CAP_A_09 @0, CAP_A_10 @4.4
- 0-2.3: wide high view: giant picture, the car tile a tiny speck.
- 2.3-5.7: gold threads link every s03 object and the car tile into a network over the picture.
- 5.7-7.0: the network rises toward a soft warm light above the crown (glow sprite, no shape).
- 7.1-8.5: last loose pieces (keep 3-4 floating until now) snap in; no gap.
### s06 (11.28 s) CAP_A_11 @0, CAP_A_12 @4.9
- 0.1-2.0: calm glow over the completed picture.
- 3.6: a cream veil cloud settles over one tile; its outline glows gold through it; the crown light reaches it.
- 5.0-6.2: lantern beside it, flame steady.
- 6.6-9.6: camera tilts down past the rim: fainter stacked pictures below (depth).
- 9.6-10.3: slow sink toward the glowing depth. 10.3-11.28: calm hold.

## Process for the builder (hard)
- Do not spawn sub-agents unless essential; then one cheap, well-defined agent.
- Stills (JPG only, never Read a PNG): `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/khs_77/film_a.html productions/khs_77/_stills --times 2,5,8,12,17,22,27,31,35,40,45,50,55,58 --fmt jpg --size 540x960 --timeout 900`, then `python tools/safe_view.py productions/khs_77/_stills --out productions/khs_77/_stills_clean --sheet 4` and Read ONLY images it marks CLEAN.
- Numeric gate: `PYTHONIOENCODING=utf-8 python tools/verify_scene.py productions/khs_77/film_a.html --out productions/khs_77/_verify --timeout 900 --cap-min 3.6` must PASS (zero P0/P1). Batch fixes; one full verify; `--shot <id>` for small re-checks. Copy the PASS report to `productions/khs_77/VERIFY_REPORT.json`.
- No video renders. Close every browser/process you opened. Disk D: is nearly full - do not leave large temp files.
- Done = film_a.html builds with zero `[STAGE3D_ERROR]`, `__dur` = 58.78, verify PASS copied to root, stills reviewed by you against the STORYBOARD. Report: files, `__dur`, verify result lines, which stills you checked, known defects. Never print Hebrew.
