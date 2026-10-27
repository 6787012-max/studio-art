# BRIEF - khs_74 / film_a: "who made the din? love" (vertical short, 57.37 s, 1080x1920)

Supervisor: strong model. Builder: ONE Sonnet agent. Output: ONE page `productions/khs_74/film_a.html`, portrait 9:16.
Audience: Jewish adults and teens on a phone. The voice (a rabbi giving a lesson) is mixed LOCALLY later - the render has NO audio.
Captions are rendered by the engine from vault IDs (`CAP_A_01..11`, timing LOCKED in `timeline.json`, `capAt`/`capUntil` local per shot). Zero Hebrew in code.
Read first: `STORYBOARD.md` (the table is the contract), this brief, `timeline.json`, `~/.claude/skills/video-production/references/builder_kit.md`.
Start from the page already here: `productions/khs_74/film_a.html` = a COPY of the finished khs_73 page (portrait setup works: `film({W:1080,H:1920,...})`, fov handling, caption box). Keep the skeleton, imports, portrait settings, no title card, no recap; replace its world, props and shots completely (khs_73 had a book/tiles/sphere - none of that stays). Make sure the timeline it loads is khs_74's.

## Owner art direction (hard)
1. 3D with a FLAT, CLEAN explainer look: toon materials, ink outline (kit default), limited palette, clean empty space around hero objects, smooth motion, gentle camera. No photoreal noise or textures. Bright, warm, not dark.
2. OBJECTS FIRST, NO PEOPLE: no character at all. Ideas are acted out by objects: cube, orb, grid, socket, screwdriver, gears, glass, dominoes, knife, log, cloud, lantern, cable.
3. The picture must EXPLAIN what is said at that moment (STORYBOARD column "what the viewer learns"). Sync key actions to the local times below.
4. Real depth: foreground / midground / background layers, parallax from camera moves, soft shadows. Every shot moves; frame 0 of every shot is never empty; hero object visible within 3 s of each shot.

## Format (hard)
- Total = sum of shots = 57.37 s exactly (`window.__dur`). Shots: s01 11.6 | s02 10.0 | s03 10.4 | s04 9.8 | s05 9.15 | s06 6.42.
- Portrait: hero zone y = 8%..60% of frame height; caption box 64%..80% (engine); bottom 20% calm (floor only). Key objects inside x = 8%..92%.
- Camera fov 60-75 (vertical). Never inside geometry; no blank start frame.
- Last 1 s of s06: calm, nothing enters (an end card follows, made elsewhere).

## Look constants
- World: warm sand/cream: skyTop 0xf3dcc0, skyBottom 0xfbf3e4, floor 0xe9d6b8, sun soft from upper right, fog pale, far ~60.
- WORKBENCH: a big walnut 0x7a5236 tabletop (box ~4 x 0.15 x 2.4 m) with simple legs; the action lives on it. Background: two or three soft cream/sage low shapes for depth.
- DIN CUBE: steel-blue 0x4a6f8f, ~0.5 m, slightly bevelled look (box + thin lighter edge lines). Bricks for rebuild: 27 small boxes (3x3x3).
- LOVE ORB: rose-gold 0xe59a7a core with warm gold 0xf2b84e emissive glow + soft halo sprite; ~0.35 m on the bench in s01; the BIG ORB in s05-s06 ~1.2 m high above centre.
- STEEL GRID: thin steel-blue lines (boxes 0.02 thick) every 0.25 m covering the bench top; can flash brighter (emissive lerp). In s05 lines extend and climb toward the sky point (tubes/lines converging).
- GOLDEN GRID (s05-s06): same pattern in gold 0xf2b84e, floating ~1.6 m above the steel grid, semi-transparent.
- Props (prefer `lib/props3d.js`, otherwise box/cyl/ball): wall socket block (cream box with two dark holes), screwdriver (handle cyl rose/red + steel shaft), gears (2-3 cyl gears with teeth boxes, steel/gold), pusher block (rose), drinking glass (clear, opacity 0.35, cyl open), shards (small flat tetra pieces), 7 domino blocks (cream) + small green lamp balls, knife (flat steel blade + walnut handle), log (cyl walnut with lighter rings at the ends, splits into two halves), mercy cloud (3-5 soft pink balls 0xf4b8c4), clear glass pane, lantern (simple cage: cyl + 4 thin posts + ball inside, dark when off), golden cable (tube) with a visible gap near the lantern.
- Spark burst: 20-30 tiny bright balls flying outward + a flash ring (torus scaling up and fading).
- No people, no women, no crosses/churches/mosques, no letters or words on objects, no Torah scroll or holy text object.

## Shots (local times; captions = IDs only)
### s01 (11.6 s) CAP_A_01 @0, CAP_A_02 @5.5 - "din and love belong together; love built the din"
- 0-1: wide on the bench, cube left / small orb right, ~0.9 m apart; slow dolly right->left.
- 1-4.6: they glide toward each other until ~0.35 m apart.
- 4.8-5.4: the orb's warm glow spreads over the cube's edges (edge lines turn warm) - "sweetening".
- 5.5-6.4: cube breaks into its 27 bricks which hover.
- 6.5-7.6: the orb fires short beams; the bricks fly back brick by brick and rebuild the cube (built FROM the orb's light: bricks glow warm on landing, then cool to steel-blue).
- 9.5-11.3: a soft ring of light links orb and cube (thin torus around both, pulsing). Camera pushes in slightly.
### s02 (10.0 s) CAP_A_03 @0, CAP_A_04 @5.1 - "nature is din: the socket"
- 0-2.0: the cube unfolds flat (faces hinge down) and becomes the STEEL GRID that spreads across the bench top (scale-in of lines from the centre outward).
- 2.3-3.7: the orb glows once (the grid was made by love) - grid lines briefly warm.
- 4.3-5.0: a sage tree, a rock and a blue stream strip rise up from the grid. Camera rises to a high 3/4 view.
- 5.2-7.6: dolly to the SOCKET block standing on the grid.
- 7.9-8.6: the screwdriver slides into one socket hole.
- 9.3-10.0: spark burst + flash ring; grid lines under it flash bright.
### s03 (10.4 s) CAP_A_05 @0, CAP_A_06 @5.6 - "rules do not move; the glass breaks"
- 0-2.6: gear train (3 gears meshing) turns steadily on the grid.
- 2.8-3.6: the rose pusher block pushes a big gear; the gear does not move off its rhythm; the pusher bounces back.
- 4.0-5.4: hold on the gears, camera slides toward the bench edge.
- 6.0: a clear glass slides to the bench edge; 6.6 tips and falls; 7.1 shatters on the floor grid into shards (shards scatter and settle).
- 8.2-9.2: the grid line under the shards lights up steel-blue (the law did it).
### s04 (9.8 s) CAP_A_07 @0, CAP_A_08 @4.8 - "every rule works; the knife cuts; mercy does not step in"
- 0-0.5: top-down view of the grid with 7 domino blocks in a row.
- 0.5-4.0: they tip one after another; each fallen block lights its small green lamp. Every single one works.
- 4.4-5.2: camera tilts to a 3/4 view of a log on the grid, a knife above it.
- 5.3-6.5: the knife descends; at 6.5 the log splits into two halves that fall apart.
- 7.0-9.1: a pink mercy cloud floats toward the split log and stops against a clear glass pane (soft bounce); the halves stay split.
### s05 (9.15 s) CAP_A_09 @0, CAP_A_10 @4.6 - "who made the rules? love - for order"
- 0-2.0: pull back: the whole bench world (tree, socket, gears, dominoes, log) on the steel grid.
- 3.3-4.2: grid lines extend past the bench edges and climb upward, converging to a dim point in the sky.
- 4.7-5.4: crane up: the BIG ORB is revealed at the convergence point.
- 5.4-7.1: warm light pours down the lines; the whole grid glows warm, and any slightly crooked lines snap straight (perfect order).
- 8.1-8.9: the GOLDEN GRID fades in above the steel grid (golden lines drawn out from the orb).
### s06 (6.42 s) CAP_A_11 @0 - "spiritual laws work like nature"
- 0-1.2: on the golden grid a lantern, joined to the big orb by a golden cable with a visible gap near the lantern.
- 1.45-2.35: the lantern flickers faintly and stays dark (the circuit is open: it does not work).
- 2.85-3.45: the lower steel grid and the upper golden grid pulse together twice in the same rhythm.
- 3.5-5.4: slow pull back: orb on top, golden grid, steel grid with the little world below - one frame.
- 5.4-6.42: calm hold.

## Process for the builder (hard)
- Do not spawn sub-agents unless essential; then one cheap, well-defined agent.
- Stills (JPG only, never Read a PNG): `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/khs_74/film_a.html productions/khs_74/_stills --times 3,7,10.5,13.5,20.9,24.5,29,34,38.5,43,48,53,56.5 --fmt jpg --size 540x960 --timeout 900`, then `python tools/safe_view.py productions/khs_74/_stills --out productions/khs_74/_stills_clean --sheet 4` and Read ONLY images it marks CLEAN.
- Numeric gate: `PYTHONIOENCODING=utf-8 python tools/verify_scene.py productions/khs_74/film_a.html --out productions/khs_74/_verify --timeout 900 --cap-min 4.2` must PASS (zero P0/P1). Batch fixes; one full verify; `--shot <id>` for small re-checks. Copy the PASS report to `productions/khs_74/VERIFY_REPORT.json`.
- No video renders. Close every browser/process you opened.
- Done = film_a.html builds with zero `[STAGE3D_ERROR]`, `__dur` = 57.37, verify PASS copied to the root, stills reviewed by you against the STORYBOARD. Report: files, `__dur`, verify result lines, which stills you checked, known defects. Never print Hebrew.
