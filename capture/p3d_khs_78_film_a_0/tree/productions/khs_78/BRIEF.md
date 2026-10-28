# BRIEF - khs_78 / film_a: "the exile itself is proof of the redemption" (vertical short, 59.41 s, 1080x1920)

Supervisor: strong model. Builder: ONE Sonnet agent. Output: ONE page `productions/khs_78/film_a.html`, portrait 9:16.
Audience: Jewish adults and teens on a phone. The voice (a rabbi giving a lesson) is mixed LOCALLY later - the render has NO audio.
Captions are rendered by the engine from vault IDs (`CAP_A_01..11`, timing LOCKED in `timeline.json`, `capAt`/`capUntil` local per shot). Zero Hebrew in code.
Read first: `STORYBOARD.md` (the table is the contract), this brief, `timeline.json`, `~/.claude/skills/video-production/references/builder_kit.md`.
Start from the page already here: `productions/khs_78/film_a.html` = a COPY of the finished khs_77 page (portrait setup works). Keep skeleton, imports, portrait settings, no title card, no recap; replace its world, props and shots completely (khs_77 sky island, puzzle, crown, clock, toy car - none of that stays). Make sure it loads khs_78's timeline (6 shots, 11 captions).

## Owner art direction (hard)
1. 3D with a FLAT, CLEAN explainer look: toon materials, ink outline (kit default), limited palette, clean empty space, smooth motion, gentle camera. No photoreal textures. Bright.
2. OBJECTS FIRST, NO PEOPLE: no character, no faces, no hands.
3. The picture must EXPLAIN what is said at that moment (STORYBOARD column "viewer learns"). Sync key actions to the local times below.
4. Real depth: foreground / midground / background (far soft hills, beads at different depths), parallax, soft shadows. Every shot moves; frame 0 of every shot never empty; hero visible within 3 s.

## Format (hard)
- Total = 59.41 s exactly (`window.__dur`). Shots: s01 11.5 | s02 9.6 | s03 11.1 | s04 10.2 | s05 9.8 | s06 7.21.
- Portrait: hero zone y 8%..60%; caption box 64%..80% (engine); bottom 20% calm. Key objects inside x 8%..92%.
- Camera fov 60-75. Never inside geometry.
- CAP_A_11 is long (16 words) and CAP_A_05 13 words: make sure the caption box fits them (3 lines / smaller font for those if the kit allows); verify must not flag overflow.
- Last 1 s of s06: calm, nothing enters (end card follows elsewhere).

## Look constants (different from the last two shorts: NOT sky-blue island / puzzle, NOT apricot gallery / plum)
- World: clean MINT landscape. Sky gradient 0xcfeee0 (top) -> 0xf6fbf7 (horizon). Ground: wide soft cream-white floor 0xf4f1e8 with gentle sage rolling hills far behind 0x9fcbb0 / 0x7fb597; fog pale mint far ~70. Key light upper left, soft shadows.
- PEDESTAL: white rounded column 0xffffff with a wide shallow GOLDEN SOCKET on top (cup / torus ring, emissive gold 0xf2b33d), glowing softly when empty.
- SPHERE ("Israel"): navy 0x23407a, glossy-toon, size clearly the hero (big in frame).
- TERRACOTTA PLATFORM + CLAMP: platform 0xc8643c rounded slab on the other side of a shallow gap; clamp = a simple arched bracket that lowers over the sphere.
- GOLD THREAD / DOTTED ARC / PULL-LINES: thin glowing gold tubes or dashed lines.
- TAG: a small gold ring with a plain round disc (NO letters, NO symbol).
- PENDULUM: slim white arch frame, a sage ball on a thin line, pulled sideways by a small terracotta hook; hook later shows dark hairline cracks and in s06 lies snapped on the ground, pendulum hanging straight.
- BEADS: 30-50 small navy spheres (same navy as the hero) scattered at many distances and depths.
- SPRING: golden coil (helix tube) under the sphere. BLOCKS: four rounded heavy blocks, terracotta 0xb5583a -> darker 0x7a3a2a, the 4th the largest; cracks = dark lines + gold light leaking (additive glow).
- No people, no faces, no women, no crosses/churches/mosques/crescents/flags, no letters, numbers or words on any object, no maps, no holy-text object.

## Shots (local times; captions = IDs only)
### s01 (11.5 s) CAP_A_01 @0, CAP_A_02 @6.4
- 0-3.0: push in on the white pedestal with the EMPTY glowing golden socket (frame 0 already shows it).
- 3.2-6.4: camera pans/trucks right across a shallow gap to the navy sphere on the terracotta platform; the socket stays visible small in the background.
- 6.5: dotted gold arc draws from sphere to the empty socket. 8.6: gold ring-tag clips onto the sphere; a taut gold thread runs from tag to socket. 10.3: terracotta clamp lowers over the sphere.
### s02 (9.6 s) CAP_A_03 @0, CAP_A_04 @4.8
- 0-4.8: camera behind the clamped sphere looking across at the far glowing socket; sphere trembles; at 2.6 small ripple rings ("not normal").
- 4.8-9.6: the thread stretches and vibrates, glow brightening; pendulum appears beside (slide/rise in at 5.0): sage ball pulled sideways by the terracotta hook, quivering; 8.6 a stronger quiver.
### s03 (11.1 s) CAP_A_05 @0, CAP_A_06 @6.3
- 0-3.7: beads scattered everywhere (already visible at frame 0), thin gold pull-lines appear one by one pointing to the pedestal.
- 3.7: faint ring outline glows around the pedestal (their place).
- 6.3-11.1: beads inch inward, lines brighten; camera rises to a top-down view by ~9.5 where all lines clearly converge on one centre.
### s04 (10.2 s) CAP_A_07 @0, CAP_A_08 @5.6
- 0-5.6: pendulum close-up: hook strains; 2.9 hairline cracks appear.
- 5.6-10.2: sphere on the golden coiled spring (on its platform); blocks drop one by one at 5.8, 6.4, 7.0, 7.8 (4th largest/darkest), spring compresses; 9.1 spring glows from inside, stack shudders.
### s05 (9.8 s) CAP_A_09 @0, CAP_A_10 @5.1
- 1.2-2.9: cracks spread through the 4th block, gold light leaks out. 4.3: spring glow peaks, stack lifts slightly.
- 5.2: release - blocks tumble off to the sides; the sphere launches on an arc across the gap; 6.5 lands in the golden socket with a soft gold burst; thread retracts.
- 7.7-9.8: scattered beads fly in and settle into the ring around the pedestal; camera orbits.
### s06 (7.21 s) CAP_A_11 @0
- 0-6.2: slow wide pull-back over the ordered scene: sphere glowing in its socket, bead ring, broken blocks dim far away, snapped hook on the ground, pendulum hanging straight at rest; warm light rises from the socket.
- 6.2-7.21: calm hold.

## Process for the builder (hard)
- Do not spawn sub-agents unless essential; then one cheap, well-defined agent.
- Stills (JPG only, never Read a PNG): `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/khs_78/film_a.html productions/khs_78/_stills --times 2,5,8,10.5,13,18,23,29,34,40,44,48,51,54,58 --fmt jpg --size 540x960 --timeout 900`, then `python tools/safe_view.py productions/khs_78/_stills --out productions/khs_78/_stills_clean --sheet 4` and Read ONLY images it marks CLEAN.
- Numeric gate: `PYTHONIOENCODING=utf-8 python tools/verify_scene.py productions/khs_78/film_a.html --out productions/khs_78/_verify --timeout 900 --cap-min 4.2` must PASS (zero P0/P1). Batch fixes; one full verify; `--shot <id>` for small re-checks. Copy the PASS report to `productions/khs_78/VERIFY_REPORT.json`.
- No video renders. Close every browser/process you opened. Disk D: is nearly full - do not leave large temp files.
- Done = film_a.html builds with zero `[STAGE3D_ERROR]`, `__dur` = 59.41, verify PASS copied to root, stills reviewed by you against the STORYBOARD. Report: files, `__dur`, verify result lines, which stills you checked, known defects. Never print Hebrew.

## !!! TIMING UPDATE (supersedes the durations and local times above; supervisor, after seam fixes) !!!
- Total = 58.36 s (`window.__dur`). Shots: s01 11.4 | s02 11.4 | s03 8.8 | s04 9.6 | s05 9.7 | s06 7.46. timeline.json is already patched - always trust it.
- Captions: s01 CAP_A_01 @0, CAP_A_02 @6.3 | s02 CAP_A_03 @0, CAP_A_04 @5.1 | s03 CAP_A_05 @0, CAP_A_06 @4.6 | s04 CAP_A_07 @0, CAP_A_08 @4.8 | s05 CAP_A_09 @0, CAP_A_10 @4.9 | s06 CAP_A_11 @0.
- s01 key times unchanged (0.7 / 6.5 dotted arc / 8.6 tag+thread / 10.3 clamp).
- s02 (11.4): 0.5 "the exile", 1.9 "not in our place" (sphere trembles + ripples), 3.4-6.8 "such a nature cannot last long" (thread stretches/vibrates), 5.1 pendulum enters, 7.1 "not proper" (stronger quiver), 8.3-10.0 "a thing cannot stay out of its place": camera widens, first scattered beads come into view at the edges (lead-in to s03).
- s03 (8.8): 0.4-2.3 "things meant to be gathered together": pull-lines appear + ring outline around pedestal at 1.5; 3.2-4.0 "cannot stay scattered": beads inch inward; 4.8-7.2 "the scattering itself is proof they must gather": camera rises to top-down, all lines converge on one centre; 7.9 "cannot persist": lines pulse.
- s04 (9.6): 0.1-2.1 "the unnatural state... not natural": pendulum close-up, hook strains, cracks at 1.8; 2.4-4.8 quiet: camera moves to the sphere on the golden spring; 4.9-5.8 "we are under subjugation": blocks 1-3 drop at 5.0, 5.5, 6.0; 6.7-7.8 "of the fourth kingdom": block 4 (largest, darkest) drops at 6.8, spring pressed flat; 8.4-9.0 "cannot be": spring glows, stack shudders.
- s05 (9.7): 1.1-1.6 "if we are under them", 2.2-2.8 "a sign I will redeem them": cracks + gold light in block 4; 4.2-4.6 "it must end": glow peaks, stack lifts; 5.1 release - blocks tumble, sphere arcs across, lands in socket at 6.3 with gold burst; 7.5-9.7 "so says the Maharal": beads fly in to the ring, camera orbits.
- s06 (7.46): 0-6.4 wide pull-back over the ordered scene (as above); 6.46-7.46 calm hold.
- Stills times: 2,5,8,10.5,13,17,21,25,29,33,38,44,48,52,57.
