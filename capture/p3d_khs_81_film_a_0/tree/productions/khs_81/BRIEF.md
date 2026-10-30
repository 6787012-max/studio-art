# BRIEF - khs_81 / film_a: "one grain every thousand years" (vertical short, 66.74 s, 1080x1920)

Supervisor: strong model. Builder: ONE Sonnet agent. Output: ONE page `productions/khs_81/film_a.html`, portrait 9:16.
Audience: Jewish adults and teens on a phone. The voice (a rabbi giving a lesson) is mixed LOCALLY later - the render has NO audio.
Captions are rendered by the engine from vault IDs (`CAP_A_01..13`, timing LOCKED in `timeline.json`, `capAt`/`capUntil` local per shot). Zero Hebrew in code.
Read first: `STORYBOARD.md` (the table is the contract), this brief, `timeline.json`, `~/.claude/skills/video-production/references/builder_kit.md`.
Start from the page already here: `productions/khs_81/film_a.html` = a COPY of the finished khs_80 page (portrait setup works). Keep skeleton, imports, portrait settings, no title card, no recap; replace its world, props and shots completely (khs_80 river valley, paper boat, orb, claw, house, puzzle - none of that stays). Make sure it loads khs_81's timeline (5 shots, 13 captions) and update the header comments.

## Idea (what the picture must explain)
The rabbi: do not think God's wisdom is "a million times ours" - we got crumbs; even "a trillion times" is the wrong picture; ours is a pitiful shadow. The classic parable of infinity: a mountain of grains so big you could faint, and a bird that comes once in a thousand years and takes ONE grain. It seems endless, but it is NOT - it will end. Infinity is not "a far end", it is a different level altogether. Everything in our reality is finite ("full, full, full - still an end"). His wisdom is a wisdom of infinity; it is not "a million times more than me".
Two heroes carry the whole film: the GOLDEN GRAIN MOUNTAIN (huge but finite) and the ENDLESS LIGHT BEAM (no top ever visible). The small bowl of crumbs (our wisdom) opens and closes the film.

## Owner art direction (hard)
1. 3D with a FLAT, CLEAN explainer look: toon materials, ink outline (kit default), limited palette, clean empty space, smooth motion, gentle camera. No photoreal textures. Bright and warm.
2. OBJECTS FIRST, NO PEOPLE: no character, no faces, no hands. The only living thing is ONE small stylized bird (simple toon body, two flat wings that flap, small beak; indigo 0x4a5aa8 with a cream belly) - it must read clearly as a bird.
3. The picture must EXPLAIN what is said at that moment (STORYBOARD column "viewer learns"). Sync key actions to the local times below.
4. Real depth: foreground / midground / background, parallax, soft shadows. Every shot moves; frame 0 of every shot never empty; hero visible within 3 s. Nothing between the camera and the hero action.

## Format (hard)
- Total = 66.74 s exactly (`window.__dur`). Shots: s01 14.5 | s02 15.9 | s03 15.6 | s04 11.6 | s05 9.14 (trust timeline.json).
- Captions: s01 CAP_A_01 @0, 02 @4.9, 03 @9.7 | s02 04 @0, 05 @4.8, 06 @10.4 | s03 07 @0, 08 @4.8, 09 @11.0 | s04 10 @0, 11 @6.6 | s05 12 @0, 13 @4.4.
- Portrait: hero zone y 8%..60%; caption box 64%..80% (engine); bottom 20% calm. Key objects inside x 8%..92%.
- Camera fov 60-75. Never inside geometry.
- CAP_A_08 (18 words), CAP_A_11 (19 words), CAP_A_13 (15 words) are long: make sure the caption box fits them (3 lines / smaller font if the kit allows); verify must not flag overflow.
- Last 0.8 s of s05: calm, nothing enters (end card follows elsewhere).

## Look constants (must differ from the last shorts: NOT aerial river valley / paper boat, NOT lilac hall / conveyor, NOT mint landscape / navy sphere)
- World: an endless warm SAND PLAIN at golden hour, seen from a LOW ground-level camera (dolly / crane moves near the ground - new camera style for the series). Sky gradient soft rose-peach 0xf6c9a8 (top) -> warm cream 0xfff3df (horizon). Ground: smooth warm sand 0xe8cfa0 with a few gentle dunes 0xd9b98a far back fading in warm fog. Small round terracotta stones 0xc8643c here and there for scale.
- GRAIN MOUNTAIN: a huge cone/heap of golden grains 0xe0a93b (lighter 0xf2c562 highlight grains on the surface, use instancing - many small ellipsoid grains on the surface, a smooth cone underneath). It must look ENORMOUS: tiny stones and the bowl at its foot give scale. It shrinks in clear steps in s03 (scale the cone down, keep surface grains), down to a SINGLE grain on bare sand.
- BIRD: see above; flies on a smooth curve, lands on the mountain, picks one grain (the grain lifts with the beak), flies away out of frame.
- THOUSAND-YEAR DIAL: a flat stone ring 0xb98a5e lying on the sand near the mountain with a small sun disc 0xffc94a and a pale moon disc 0xf4f1ea riding around it; one full turn = one visit of the bird. No numbers, no letters.
- LIGHT BEAM: a tall vertical column of soft white-gold light 0xfff1c4 (additive, soft edges, gentle upward-moving shimmer bands), rising from the plain far right into the sky; its top must NEVER be visible - it fades out above the frame in every shot.
- BOWL OF CRUMBS: small round clay bowl 0xb5653f with a few golden crumbs; in s01 identical bowls stack into a tower that grows (doubling) - still tiny next to the beam; the tower then collapses back into the one bowl, which casts a long thin shadow across the sand.
- LIGHT ROAD (s02 opening): a flat glowing ribbon 0xfff1c4 on the sand running straight to the horizon; the camera dollies along it and the horizon never gets closer.
- WORLD DOME (s04): a huge clear glass dome (soft cyan-white rim 0xdff3f2, very transparent) that holds the whole plain + empty spot where the mountain was; a measuring ribbon 0x4fb0aa stretches out three times further, and the third time it stops hard against a small flat end-cap/wall 0x7a4a36 (= an END).
- No people, no faces, no women, no crosses/churches/mosques/crescents/flags, no letters, numbers, question marks or words on any object, no holy-text object.

## Shots (local times; captions = IDs only)
### s01 (14.5 s) CAP_A_01 @0, CAP_A_02 @4.9, CAP_A_03 @9.7
- Frame 0: low camera on the sand, the clay bowl with crumbs in the foreground left, the light beam already standing far right rising out of frame. Slow push-in.
- 1.0-4.6: copies of the bowl stack up beside it into a tower (fast pops, doubling), the tower rises to about half the beam's visible height.
- 4.9-9.4: camera cranes up along the tower; the tower keeps doubling (taller, taller), but the beam always continues beyond the top of the frame; the crumbs in the base bowl glint at 6.0.
- 9.7-14.3: the tower collapses down (bowls fall back / shrink into the base bowl) by 11.0; camera back low; the bowl's long thin shadow stretches across the sand (13.0); the bright beam stays.
### s02 (15.9 s) CAP_A_04 @0, CAP_A_05 @4.8, CAP_A_06 @10.4
- 0-4.8: the light road glows on, from the bowl to the horizon; camera dollies forward along it; the horizon never comes closer (dunes slide past, the end never arrives).
- 4.8-10.4: from 5.0 grains pour down from the sky in a golden stream and pile into the HUGE mountain; camera pulls back and back (7-10) so the mountain keeps getting bigger in frame; tiny stones and the bowl at its foot for scale.
- 10.4-15.9: the stone dial lies on the sand in the foreground; 10.8 the bird flies in from the left, lands on the mountain slope at 12.0, picks ONE grain 12.5, flies off right with it by 13.8; the sun disc on the dial travels one full turn 13.8-15.7.
### s03 (15.6 s) CAP_A_07 @0, CAP_A_08 @4.8, CAP_A_09 @11.0
- 0-4.8: time-lapse: the dial spins fast, sky tint cycles warm -> dusk -> warm, the bird arrives and leaves again and again (at least 4 quick visits); the mountain hardly changes.
- 4.8-11.0: the mountain shrinks in clear steps (5.5, 7.0, 8.5, 9.8) - each step a soft settle with a puff of grain dust; the bird keeps coming.
- 11.0-15.6: a SINGLE grain left on bare sand (11.4); the bird lands, takes it (12.6), flies off; the plain is empty; the light beam on the right still rises, unchanged. Camera low, slow sideways drift.
### s04 (11.6 s) CAP_A_10 @0, CAP_A_11 @6.6
- 0-6.6: camera cranes up along the light beam; the empty plain below shrinks to a small disc, the beam keeps rising past the camera - its top never appears.
- 6.6-11.6: camera swings out: the whole plain world sits under the glass dome (seen from outside, the beam passes up through the dome top and continues); 7.2 the teal measuring ribbon shoots out across the plain, 8.2 further, 9.2 further, and at 9.9 it stops hard against the small end-cap at the dome wall (a small bump). The beam alone continues beyond the dome.
### s05 (9.14 s) CAP_A_12 @0, CAP_A_13 @4.4
- 0-4.4: camera rises out of the dome and follows the beam up; the dome falls away below; the beam fills the frame centre, warm glow increases.
- 4.4-9.14: slow descent back to sand level at the foot of the beam: the small clay bowl with crumbs in the foreground, the endless beam behind it rising out of frame. Calm hold from 7.5, very slow drift; nothing new after 8.3.

## Process for the builder (hard)
- Do not spawn sub-agents unless essential; then one cheap, well-defined agent.
- Stills (JPG only, never Read a PNG): `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/khs_81/film_a.html productions/khs_81/_stills --times 0.3,3.5,7.5,12.5,15,19,23,27.5,31,37,43,47,52,58.5,61,64,66.4 --fmt jpg --size 540x960 --timeout 900`, then `python tools/safe_view.py productions/khs_81/_stills --out productions/khs_81/_stills_clean --sheet 4` and Read ONLY images it marks CLEAN (if a sheet is BLOCKED, read the single clean stills).
- Numeric gate: `PYTHONIOENCODING=utf-8 python tools/verify_scene.py productions/khs_81/film_a.html --out productions/khs_81/_verify --timeout 900 --cap-min 4.2` must PASS (zero P0/P1). Batch fixes; one full verify; `--shot <id>` for small re-checks. Copy the PASS report to `productions/khs_81/VERIFY_REPORT.json`.
- No video renders. Close every browser/process you opened. Do not leave large temp files.
- Done = film_a.html builds with zero `[STAGE3D_ERROR]`, `__dur` = 66.74, verify PASS copied to root, stills reviewed by you against the STORYBOARD. Report: files, `__dur`, verify result lines, which stills you checked, known defects. Never print Hebrew.
