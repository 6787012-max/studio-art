# stef_32 - "The one who surrounds his fellow" (ha-makif) - 3D graphics layer for a concept video

## What this film is
A 167.95 s silent 3D picture (1920x1080, 30 fps) that becomes the GRAPHICS LAYER of a lesson video. Later, locally, two
animation clips of another studio are laid OVER shots s05 and s09 (rectangle x160-1760, y20-920, 0-9.8 s of the shot) and
music is mixed in. Nothing of those clips is in this folder or in this code. The video plays in a school lobby WITHOUT SOUND:
every shot must explain its idea by what the objects DO; the caption (vault ID) is the words.

Read: `~/.claude/skills/video-production/references/builder_kit.md` (engine rules), this file, `timeline.json` (locked shot
durations + capAt) and `shots.ids.md` (shot table). Closest finished examples of this series: `productions/stef_31/`
(`BRIEF.md`, `film_a.html`, `mn.js`, `render.json`) and `productions/stef_30/`. COPY stef_31's page structure, its
clip-hold backdrop, its clock ring and its question-shot pattern; then build the new objects. Write
`productions/stef_32/film_a.html` and a shared module `productions/stef_32/mk.js`; copy `stef_31/render.json` to
`stef_32/render.json` (adjust includes: mk.js instead of mn.js, plus any assets you use).

## Hard technical contract
- `film({title:'TITLE', kicker:'KICKER', vault:'captions_vault.json', shots:[...]})` - NO recap, so `__dur` must equal
  exactly 167.95 (sum of timeline.json shot durations). Shots s01..s13 in order, each `dur` = timeline.json value, `caps` =
  caption IDs of that shot in order, `capAt` = timeline.json capAt of that shot. s01 has no caps (title card overlays 0-4.2 s).
- Captions sit in the bottom band (about y 0.78H-0.95H). Keep every key action in the upper 75% of the frame.
- Deterministic (function of t only), toon + ink house style, `Wd.hero = <main object>` in every shot.
- NO people, no hands. The two neighbours are shown as two COLOURED LAND PLOTS (no figures): the inner field = "Shimon"
  = warm wheat-gold plot; the surrounding land = "Reuven" = green meadow ring around it. Optional: a small coloured flag
  pole on each plot (gold flag for inner, green flag for outer) as their "markers". No text in 3D except ASCII digits.
- Assets: engine shapes (`box cyl ball`) are right: fence/wall segments = rows of stone-coloured boxes that RISE from the
  ground (scale y 0->1 with a small dust puff of balls); coins = flat gold cylinders. Optional CC0 props from the library
  (`python tools/assetlib.py search wheat|fence|stone --cat prop|nature`), copied into `productions/stef_32/assets/`.

## Art direction (owner order 26/10/2026)
Clean bright flat-explainer look rendered in 3D: soft toon materials, 4-5 colours, lots of clean space, simple sky
backdrop, smooth motion, gentle camera moves, real depth (foreground grass tufts / mid plots / far soft hills, parallax).
Palette: sky #CFE6F2, wheat gold #E3B94A, meadow green #7FB86A, stone #C9B48F (ink edges #8C7650), coin gold #F2C230,
accent red #C2453A (only for the X / "no" mark). Warm near-white key light. Every shot moves; frame 0 never empty; the hero
object visible within 3 s.

## The central visual idea
ONE square inner field (wheat gold) inside a larger green surrounding ring, seen in 3/4 high view - the same layout in
every shot, so the viewer learns one situation deeply. Build once in `mk.js`: `plots()` (inner square + outer ring + flags),
`wallSide(i, grow)` for the 4 sides (i=0..3, rising stone wall segments along that side of the inner field),
`coinStack(n)`, `coinFlight(from,to,p)` (coins hop in an arc from the inner plot to the outer plot), `checkMark()` and
`xMark()` (built from boxes), `clockRing()` (copy from stef_31), `courtyard()` for s08 (two small paved courtyards side by side
with one shared wall between them).

## STORYBOARD (time = local seconds inside the shot)
| shot | dur | idea (caption IDs) | what the OBJECTS do + camera | character | viewer learns |
|---|---|---|---|---|---|
| s01 | 7.65 | title | Empty green land; from 1.0 s the inner gold square field rises softly out of the meadow, flags pop up on both plots; at 5 s faint ghost outlines of four walls flicker around the inner field (a hint of the question). Camera: slow crane down from high 3/4. | none | the subject: a field surrounded by a neighbour's land |
| s02 | 13.69 | Mishna quote: if the surrounded one fenced the 4th side, everything is rolled onto him (CAP_s02_1) | Three walls already stand on three sides; the 4th side is open. From 4 s the 4th wall rises (dust puff); at 8 s a ring of light runs around ALL four walls together and coins hop from the inner plot to the outer plot. Camera: slow orbit 30 deg. | none | closing the 4th side makes him pay for all |
| s03 | 11.53 | the situation: Reuven surrounds Shimon (CAP_s03_1, _2) | Top-down-ish view: the gold inner field pulses (gold flag waves), then the green ring around it lights up section by section all the way around (green flag waves) - "around him". Camera: slow rise to a more top view. | none | inner field vs surrounding land |
| s04 | 12.07 | Reuven fenced three sides; Shimon did not ask - not obliged (CAP_s04_1, _2) | Walls rise one by one on sides 1,2,3 (digits 1 2 3 float above each as it rises). At the 2nd caption a single coin lifts from the inner plot, hesitates, and sinks back; a red X (two boxes) briefly appears over the coin path. Camera: gentle push-in. | none | three walls - no payment |
| s05 | 9.35 | CLIP HOLD (CAP_s05_1, _2) | Clip covers x160-1760 y20-920 for 0-9.8 s. Calm soft backdrop (sky, distant hills, drifting light motes, slow parallax of grass tufts at the far left/right edges). Nothing important in the centre. Camera: almost still drift. | none | (the clip explains) |
| s06 | 12.07 | why: he showed the fence is good for him (CAP_s06_1, _2) | Three walls stand; the 4th rises from the INNER side (gold-tinted dust, gold flag dips toward it). When closed, a soft gold glow spreads from the 4th wall over the whole inner field (it is now a safe enclosed field - small wheat tufts sway calmly inside, a light "shield" dome shimmers once). Camera: slow arc. | none | closing it shows he wants an enclosed field |
| s07 | 10.99 | rolled onto him: shares in ALL the walls, not only the 4th (CAP_s07_1, _2) | All four walls; a light runs along wall 4 first, then continues to walls 1,2,3 (each lights in turn); for each lit wall a small coin stack grows beside it, then all stacks hop as coins to the outer plot. Camera: low wide, slow rise. | none | he shares in all four walls |
| s08 | 13.69 | another case in the Mishna: a wall between two courtyards; one who leans his own wall on it showed he benefits (CAP_s08_1, _2) | Two paved courtyards side by side, one tall shared wall between them (built). At the 2nd caption a second wall rises in the right courtyard and joins the shared wall at a right angle (a small click flash where they touch); then a coin stack from the right courtyard hops over to the left one. Camera: slow orbit. | none | joining your wall to his = you benefit |
| s09 | 9.35 | CLIP HOLD (CAP_s09_1, _2) | Same calm backdrop as s05 (reuse). | none | (the clip explains) |
| s10 | 19.48 | QUESTION 1 (CAP_s10_1 question; think 6.5-11.5; CAP_s10_2 answer) | Three walls stand, 4th side open; clock ring floats above, its ring fills during 6.5-11.5. Answer: the coin above the inner plot sinks back down and the red X appears over the coin path; the open 4th side stays open (grass sways there). Camera: slow drift. | none | three walls alone - no payment |
| s11 | 20.38 | QUESTION 2 (CAP_s11_1; think 6.5-11.5; CAP_s11_2 answer) | Same clock countdown. Answer: the 4th wall rises, the enclosed field glows gold, then light runs around all four walls and coins hop from the inner plot to the outer plot. Camera: low wide, gentle rise. | none | closing it = shows he wants it = shares in all |
| s12 | 18.25 | SUMMARY (CAP_s12_1 / _2, about 9 s each) | One continuous glide: (1) three walls + coin sinking back + X, (2) 4th wall rises from inside, glow, all four walls light, coins hop over. | none | recap |
| s13 | 7.46 | credits (CAP_s13_1) | Calm wide of the enclosed field at golden evening light, wheat sways, light motes. | none | end |

## Done condition
`python tools/verify_scene.py productions/stef_32/film_a.html --out productions/stef_32/_verify --timeout 900` = PASS (zero
P0/P1), report copied to `productions/stef_32/VERIFY_REPORT.json`. Batch fixes, one full verify. Also render stills (JPG) at
absolute times = shot start + local: s01 5.5, s02 10, s04 9, s06 9, s07 8, s08 11, s11 15, s12 13 with
`tools/stills.py ... --fmt jpg --size 960x540` into `productions/stef_32/_stills` for the supervisor. No full render.
NEVER Read a PNG. Never put Hebrew in code or chat; captions only as vault IDs.
