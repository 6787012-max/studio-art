# BRIEF - khs_73 / film_a: "laws for cases that never happen" (vertical short, 57.61 s, 1080x1920)

Supervisor: strong model. Builder: ONE Sonnet agent. Output: ONE page `productions/khs_73/film_a.html`, portrait 9:16.
Audience: Jewish adults and teens on a phone. The voice (a rabbi giving a lesson) is mixed LOCALLY later - the render has NO audio.
Captions are rendered by the engine from vault IDs (`CAP_A_01..11`, timing LOCKED in `timeline.json`, `capAt`/`capUntil` local per shot). Zero Hebrew in code.
Read first: `STORYBOARD.md` (the table is the contract), this brief, `timeline.json`, `~/.claude/skills/video-production/references/builder_kit.md`.
Start from the copy of the pilot page that is already here: `productions/khs_73/film_a.html` (kh_short60 pilot, portrait setup works: `film({W:1080,H:1920,...})`, fov handling). Replace its world/shots completely; keep the page skeleton, imports, portrait settings, no title card, no recap.

## Owner art direction (hard)
1. 3D with a FLAT, CLEAN explainer look: toon materials, ink outline (kit default), limited palette, plenty of clean empty space around the hero objects, smooth motion, gentle camera. No photoreal noise or textures. Bright, not dark.
2. OBJECTS FIRST, NO PEOPLE: this film has NO character at all. The ideas are acted out by objects: book, tiles, globe, orb, beam, thread, gears, lens, sphere.
3. The picture must EXPLAIN what is said at that moment (see the STORYBOARD column "what the viewer learns"). Sync the key actions to the local times below.
4. Real depth: foreground / midground / background layers, parallax from camera moves, soft shadows. Every shot moves; frame 0 of every shot is never empty or blank; hero object visible within 3 s of each shot.

## Format (hard)
- Total = sum of shots = 57.61 s exactly (`window.__dur`). Shots: s01 9.35 | s02 10.25 | s03 10.35 | s04 9.55 | s05 9.8 | s06 8.31.
- Portrait: hero zone y = 8%..60% of frame height; caption box 64%..80% (engine); bottom 20% calm (floor only). Key objects inside x = 8%..92%.
- Camera fov 60-75 (three.js fov is vertical). Never inside geometry; no blank grey start frame.
- Last 2 s of s06: calm, nothing enters the frame (an end card follows, made elsewhere).

## Look constants (numbers)
- World: `ground:'paper'` (or a pale floor disc 0xefe6d2), skyTop 0xbfe3df, skyBottom 0xfbf4e6, hemi near-neutral warm, sun soft from upper left, fog pale, far ~60. Optional thin floor ring/platform 0xe6dcc6 under the stand.
- Palette: navy 0x1f3a5a, teal 0x3f8f8a, gold 0xf2c14e (emissive tint ok), coral 0xe8825a, cream 0xf6efe0. 3-5 colours per shot.
- BOOK: `bookOpen` from lib/props3d.js scaled up (about 1.2 m wide) on a simple reading stand (box/cyl, wood 0x8a5a3a) centre-low; a small lamp on the stand (cyl + ball, gold glow when lit).
- LAW TILE: flat hexagon (cyl with 6 radial segments, r 0.18, h 0.05), navy or teal body + thin gold rim; ODD TILE (strange case) in coral, each a different odd form: twisted hex (rotated stacked slices), spiral (torus-knot-like or helix of small balls), star prism, cube on its point, hex with a hole. Keep them readable at phone size (r >= 0.22 for the hero odd tile).
- GLOBE (practical world): ball r 0.35 teal/green with cream continents (simple), on a short pedestal, at the right side; dashed landing ring = small torus 0.04 dashes on top.
- ORB (His will): soft sun-disc / glowing ball r ~0.8 high above centre, gold-cream, with slow soft rays; BEAM = translucent cone from orb to target.
- SPHERE OF LIGHT: icosphere ~r 1.6 under the orb, made of hex tile slots (dotted cream outline when empty, gold tile when filled); fill fraction is a function of t.
- "?" glyph: `canvasTex` plain "?" (no Hebrew) on a sprite, gold, bobbing.
- Hourglass: two cones + frame, flips by t. Gears: 2-3 extruded/cyl gears turning by t. Magnifying lens: torus + thin disc + handle.
- No people, no women, no crosses/churches/mosques, no letters or words on objects.

## Shots (local times; captions = IDs only)
### s01 (9.35 s) CAP_A_01 @0, CAP_A_02 @4.4 - "from the book come many laws, some strange"
- 0-3.8: wide on the book on its stand (book ~35% of frame width), pages flip, a soft glow rises from the pages; camera slow push in.
- 4.4-7.8: about 20 law tiles fly out of the pages in an upward fan (staggered tweens), settling in a loose cloud above the book.
- 6.5-8.0: odd coral tiles appear among them (4-5 different forms).
- 8.2-9.35: ONE odd coral tile (the hero tile, r 0.25) moves to frame centre, spins slowly; a gold "?" pops above it at 8.4.
### s02 (10.25 s) CAP_A_03 @0, CAP_A_04 @5.65 - "never happens in the world; still, it is His will = the law"
- 0-1.2: crane down/right: the hero odd tile drifts toward the small globe; the dashed landing ring on the globe stays EMPTY; the tile stops 0.4 m above it. An hourglass beside the globe flips at 0.3 and 1.0.
- 1.7-2.4: the "?" pulses once more.
- 3.1-4.7: tilt up: the ORB is revealed high above; a BEAM comes down onto the hero tile.
- 5.7-7.6: in the beam the hero tile turns gold (colour lerp) and a matching seal-shape plate under it lights up (law stamped).
- 8.3-10.25: hold: beam steady, tile glowing, slow drift of camera.
### s03 (10.35 s) CAP_A_05 @0, CAP_A_06 @5.35 - "understanding attaches you to His will"
- 0-2.2: a gold thread (thin tube with travelling bright dash) runs orb -> gold tile -> open book; the book glows warmer.
- 2.7-4.9: a dashed path from the tile toward the globe appears and fades out (it is not about a practical result); globe stays plain.
- 5.6-6.5: the beam brightens.
- 7.8-10.35: the book pages flip, the stand lamp lights, small sparks travel up the thread from book to tile to orb. Camera: slow orbit (about 25 degrees) around the stand.
### s04 (9.55 s) CAP_A_07 @0, CAP_A_08 @4.45 - "so many strange cases - to understand and toil"
- 0.3-2.9: pull back: 8-10 different odd coral tiles orbit the book like a slow carousel (ring radius ~1.3 m, tilted).
- 3.1-3.8: the globe at the side stays dimmed (not about us).
- 4.4-6.3: 2-3 gears appear under the book and turn (toil); a magnifying lens sweeps in and stops over one odd tile.
- 7.3-9.55: that tile turns to show its sides under the lens.
### s05 (9.8 s) CAP_A_09 @0, CAP_A_10 @4.5 - "piece after piece"
- 0-2.9: crane up from the book to the orb: the SPHERE OF LIGHT outline under the orb, only 5-6 gold tiles filled.
- 3.5-4.4: first tile flies from the book up and locks in at 3.9 with a flash ring.
- Lock beats (pulse ring each) at 4.9, 6.4, 7.0, 7.4; then 7.3-8.9 a fast stream of tiles; sphere about 70% full at the end.
### s06 (8.31 s) CAP_A_11 @0 - "the whole Torah: no point left out"
- 0-1.1: all carousel tiles stream up into the sphere.
- 2.7-3.6: the sphere completes (100%) and glows; the orb and sphere join in one soft light.
- 4.1-6.3: a light scan band passes over the sphere (no gap anywhere); slow pull back showing book, globe, sphere, orb in one frame.
- 6.3-8.31: calm hold, nothing new enters.

## Process for the builder (hard)
- Do not spawn sub-agents unless essential; then one cheap, well-defined agent.
- Stills (JPG only, never Read a PNG): `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/khs_73/film_a.html productions/khs_73/_stills --times 3,8.8,13,17,23,28,32,37,42,47,53,57 --fmt jpg --size 540x960 --timeout 900`, then `python tools/safe_view.py productions/khs_73/_stills --out productions/khs_73/_stills_clean --sheet 4` and Read ONLY images it marks CLEAN.
- Numeric gate: `PYTHONIOENCODING=utf-8 python tools/verify_scene.py productions/khs_73/film_a.html --out productions/khs_73/_verify --timeout 900` must PASS (zero P0/P1). Batch fixes; one full verify; `--shot <id>` for small re-checks. Copy the PASS report to `productions/khs_73/VERIFY_REPORT.json`.
- No video renders. Close every browser/process you opened.
- Done = film_a.html builds with zero `[STAGE3D_ERROR]`, `__dur` = 57.61, verify PASS copied to the root, stills reviewed by you against the STORYBOARD (each still shows the object action of its row). Report: files, `__dur`, verify result lines, which stills you checked, known defects. Never print Hebrew.
