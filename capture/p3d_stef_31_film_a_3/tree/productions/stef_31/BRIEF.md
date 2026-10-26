# stef_31 - "The Menorah" - 3D graphics layer for a concept video

## What this film is
A 215.74 s silent 3D picture (1920x1080, 30 fps) that becomes the GRAPHICS LAYER of a lesson video. Later, locally, five
animation clips of another studio are laid OVER shots s05, s07, s09, s10, s11 (rectangle x160-1760, y20-920) and audio is
mixed in. Nothing of those clips is in this folder or in this code. The video plays in a school lobby WITHOUT SOUND: every
shot must explain its idea by what the objects DO; the caption (vault ID) is the words.

Read: `~/.claude/skills/video-production/references/builder_kit.md` (engine rules), this file, `timeline.json` (locked shot
durations + capAt) and `shots.ids.md` (shot table). The closest finished example is the previous lesson of this series:
`productions/stef_30/` (`BRIEF.md`, `film_a.html`, `lp.js`, `render.json`) - COPY its page structure, its clip-hold backdrop,
its clock ring and its question-shot pattern; then build the new objects. Write `productions/stef_31/film_a.html` and a shared
module `productions/stef_31/mn.js`; copy `stef_30/render.json` to `stef_31/render.json` (adjust includes if you use others).

## Hard technical contract
- `film({title:'TITLE', kicker:'KICKER', vault:'captions_vault.json', shots:[...]})` - NO recap, so `__dur` must equal exactly
  215.74 (sum of timeline.json shot durations). Shots s01..s16 in order, each `dur` = timeline.json value, `caps` = the caption
  IDs of that shot in order, `capAt` = timeline.json capAt of that shot. Shot s01 has no caps (the title card overlays 0-4.2 s).
- Captions sit in the bottom band (about y 0.78H-0.95H). Keep every key action in the upper 75% of the frame.
- Deterministic (function of t only), toon + ink house style, `Wd.hero = <main object>` in every shot.
- No people at all, no hands. Tools move by themselves. No text in 3D except ASCII digits (`label('7')`, `label('22')` etc.).
- Assets: plain engine shapes (`box cyl ball`, lathe/torus if the engine or three.js gives them) - simple and clean is right.
  Optional CC0 candle/flame helpers as in stef_30. Copy any GLB you use into `productions/stef_31/assets/`.

## Art direction (owner order 26/10/2026)
Clean bright flat-explainer look rendered in 3D: soft toon materials, 4-5 colours, lots of clean space, simple backdrop,
smooth motion, gentle camera moves, real depth (foreground/mid/background layers, parallax). Palette: cream backdrop
#F3E6C8, gold #E2B43C (edges #B8871B), flame orange #F59A23 with a soft glow, oil olive #B9A53A, night blue #24345C (only in
sky changes), deep red accent #8E2B2B (curtain hint at far edges). Warm near-white key light. Every shot moves; frame 0 of
every shot is never empty; the hero object is visible within 3 s.

## The central visual idea
ONE golden seven-branched Menorah, the same object in every shot, so the viewer learns one object deeply. Build it once in
`mn.js`: `menorah({grow:0..1})` - a 3-legged base, a central shaft, three curved branch pairs (semicircle arcs, all lamp tops
at the SAME height), small ornaments on shaft and branches: cups (small inverted cones), knobs (small balls), flowers (small
open petal rings); seven lamp cups on top with flames (`lit` per lamp 0/1). Also `goldBlock()`, `hammer()` (a floating gold
hammer, no hand), `lampCup({transparent, oil:0..1, wick, flame})`, `halfMeasure()` (small jug), `clockRing()` (copy from
stef_30), `skyDome(phase)` (day / dusk / night with stars / dawn).
Height: tall and slender, lamps at about 0.62H on screen in a medium shot.

## STORYBOARD (time = local seconds inside the shot)
| shot | dur | idea (caption IDs) | what the OBJECTS do (the action that explains it) + camera | character | viewer learns |
|---|---|---|---|---|---|
| s01 | 7.65 | title (TITLE/KICKER card 0-4.2) | A glowing gold block on a cream stage; from 1.0 s the Menorah grows UP out of the block (the block shrinks as base, shaft, branches rise), lamps appear by 6.5 s and light one by one. Camera: slow crane down from high 3/4. | none | the subject: the golden Menorah |
| s02 | 9.43 | verse "a Menorah of pure gold, hammered (mikshah)" (CAP_s02_1) | A gold block; a floating hammer taps it rhythmically (about 1 tap/s); each tap sends a spark ring and the block reshapes one step toward the Menorah silhouette (stepwise morph: block -> tall bar -> bar with arms -> full Menorah) by 8.5 s. Camera: slow orbit 35 deg. | none | it is beaten from gold |
| s03 | 12.07 | mikshah = ONE block, no joined parts (CAP_s03_1, CAP_s03_2) | 0-5.5: the finished Menorah, a bright light sweep runs continuously from the base up through every branch to the lamps (one piece, no seams). From the 2nd caption: a dull "wrong" ghost Menorah slides in beside it, made of separate pieces with visible gaps and bolts; its pieces drift apart, a red X (two thin red boxes) appears over it and it fades; the true one shines. Camera: push-in then small pull-back to show both. | none | one block, not assembled parts |
| s04 | 9.37 | seven lamps: centre + three on each side (CAP_s04_1, CAP_s04_2) | Lamps light in order: centre first (digit 1 floats above), then left/right pairs outward (2-7); at the 2nd caption the left three branches glow one tint and the right three another, the centre shaft white-gold, showing 3+1+3. Camera: frontal push-in, slight rise. | none | 7 = 1 + 3 + 3 |
| s05 | 21.95 | CLIP HOLD (CAP_s05_1, _2) | Clip covers x160-1760 y20-920 for 0-21.4 s. Calm, beautiful, softly moving cream/gold backdrop (drifting gold motes, gentle parallax of red curtain folds at the far left/right edges). Nothing important in the centre. Camera: almost still drift. | none | (the clip explains) |
| s06 | 12.07 | ornaments: cups, knobs, flowers - 22, 11, 9, all from the same gold (CAP_s06_1, _2) | Close glide up the Menorah: in three passes the ornament types light up - all cups glow (digit 22 floats beside), then all knobs pulse (digit 11), then all flowers open their petals (digit 9). At the 2nd caption every ornament flows a light back into the shaft and the whole Menorah glows as one. Camera: vertical crane along the shaft, then pull-back. | none | the decorations, counted, part of the one piece |
| s07 | 9.95 | CLIP HOLD (CAP_s07_1) | Same calm backdrop as s05 (reuse), clip covers 0-9.4 s. | none | (the clip explains) |
| s08 | 12.07 | morning: cleaning and preparing the lamps (CAP_s08_1, _2) | Sky dome behind goes from night (stars) to dawn light. The lamps are out; from each lamp a small dark burnt wick lifts out and floats into a small gold bowl at the side, one after another; then a shine sweep polishes each lamp cup and a fresh white wick drops into each. Camera: slow arc at lamp height. | none | in the morning the lamps are cleaned and readied |
| s09 | 10.55 | CLIP HOLD (CAP_s09_1) | Same calm backdrop (reuse), clip 0-10.0 s. | none | (the clip explains) |
| s10 | 18.05 | CLIP HOLD (CAP_s10_1, _2) | Same calm backdrop (reuse), clip 0-17.5 s. Slow continuous movement so it never looks frozen. | none | (the clip explains) |
| s11 | 15.55 | CLIP HOLD (CAP_s11_1, _2) | Same calm backdrop (reuse), clip 0-15.0 s. | none | (the clip explains) |
| s12 | 11.53 | why half a log: so it burns ALL night, even the long winter nights (CAP_s12_1, _2) | One lamp cup big in the centre, transparent wall: olive oil inside, a lit flame. Behind it the sky dome runs dusk -> long night (stars, a moon arcs slowly across, a few snowflakes fall = winter) -> dawn; the oil level goes down slowly and steadily, reaching near the bottom exactly as dawn arrives - the flame never goes out. Camera: slow push-in. | none | the measure lasts until morning |
| s13 | 17.82 | QUESTION 1 (CAP_s13_1 question; think 5.3-10.3; CAP_s13_2 answer) | Clock ring floats above the Menorah, its gold ring fills like a countdown during 5.3-10.3. Answer: the Menorah splits into separate pieces that hang apart for a moment, then they melt back into one gold block, and the hammer re-forms it into one whole Menorah. Camera: slow drift. | none | question + reveal |
| s14 | 18.98 | QUESTION 2 (CAP_s14_1; think 6.9-11.9; CAP_s14_2 answer) | Same clock countdown 6.9-11.9. Answer: seven small half-measure jugs stand in a row in front of the Menorah; they pair up and merge: every two halves become one full jug - three full jugs + one half jug remain (digits 3 and a small half jug beside); then each half jug's oil streams into a lamp and all seven light. Camera: low wide, gentle rise. | none | 7 halves = 3 and a half |
| s15 | 21.25 | SUMMARY (CAP_s15_1 / _2 / _3, about 7 s each) | One continuous camera glide: (1) block + hammer becoming the Menorah, (2) seven lamps lit + ornaments glowing, (3) dawn: wick into the bowl, oil cup full. | none | recap |
| s16 | 7.45 | credits (CAP_s16_1) | Calm wide of the lit Menorah, light slowly dims, gold motes. | none | end |

## Done condition
`python tools/verify_scene.py productions/stef_31/film_a.html --out productions/stef_31/_verify --timeout 900` = PASS (zero
P0/P1), report copied to `productions/stef_31/VERIFY_REPORT.json`. Batch fixes, one full verify. Also render stills (JPG)
at s01 5.5, s03 9, s04 7, s06 9, s08 9, s12 8, s14 15, s15 10 (absolute times = shot start + local) with
`tools/stills.py ... --fmt jpg --size 960x540` into `productions/stef_31/_stills` for the supervisor. No full render.
NEVER Read a PNG. Never put Hebrew in code or chat; captions only as vault IDs.
