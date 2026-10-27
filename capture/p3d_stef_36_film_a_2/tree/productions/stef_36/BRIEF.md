# stef_36 - "Iron flock" (tzon barzel) - 3D graphics layer for a concept video

## What this film is
A 277.54 s silent 3D picture (1920x1080, 30 fps) that becomes the GRAPHICS LAYER of a lesson video. Later, locally, three
animation clips of another studio are laid OVER shots s07 (0-18.0 s), s10 (0-27.0 s) and s12 (0-37.5 s) (rectangle
x160-1760, y20-920) and music is mixed in. Nothing of those clips is in this folder or in this code. The video plays in a
school lobby WITHOUT SOUND: every shot must explain its idea by what the objects DO; the caption (vault ID) is the words.

Topic (for you, English only): "Iron flock" is a deal: a Jew receives sheep from a gentile owner to raise them and keep the
profit, but he GUARANTEES their value - even if a sheep dies he pays its full value, the capital never "breaks" (like iron).
If the Jew does not pay, the gentile may come and SEIZE the sheep (a lien). A firstborn animal is holy (bechor) ONLY if no
gentile has a share in its mother; while the gentile can seize an animal, he counts as having a share. The question: how many
GENERATIONS does the gentile's hold reach? Generation 1 (the original sheep) and generation 2 (its young) are held by the
gentile, so the firstborn lamb born to generation 2 (= generation 3) is NOT holy; generation 3 is already free, so ITS
firstborn (generation 4) IS holy. Trick: if the Jew hands the gentile the young INSTEAD of the mothers, the mothers become
free and the young enter the lien - the whole chain shifts ONE generation further (then generation 5 is the first holy one).
Two sages (Rav Huna, Rav Yehuda) disagree about generation 4: Rav Yehuda says the gentile may seize even the young of a
held animal, so the chain is longer.

Read: `~/.claude/skills/video-production/references/builder_kit.md` (engine rules), this file, `timeline.json` (locked shot
durations + capAt) and `shots.ids.md` (shot table). Closest finished example: `productions/stef_35/` (`BRIEF.md`,
`film_a.html`, `ps.js`, `render.json`) - it already has a SHEEP and LAMB built from shapes, meadow/sky/hills, clip-hold
backdrop shots, the clock ring question pattern, coin columns, red X / green check billboards. COPY stef_35's page
structure and its sheep, then build the new objects. Write `productions/stef_36/film_a.html` and a shared module
`productions/stef_36/tz.js`; copy `stef_35/render.json` to `stef_36/render.json` (adjust includes: tz.js instead of ps.js,
plus any assets you actually use).

## Hard technical contract
- `film({title:'TITLE', kicker:'KICKER', vault:'captions_vault.json', shots:[...]})` - NO recap, so `__dur` must equal
  exactly 277.54 (sum of timeline.json shot durations). Shots s01..s16 in order, each `dur` = timeline.json value, `caps` =
  caption IDs of that shot in order, `capAt` = timeline.json capAt of that shot. s01 has no caps (title card overlays 0-4.2 s).
- Captions sit in the bottom band (about y 0.78H-0.95H). Keep every key action in the upper 75% of the frame.
- Deterministic (function of t only), toon + ink house style, `Wd.hero = <main object>` in every shot.
- NO people, no hands, no blood. Actions are done by objects themselves (things slide, float, pop, glow, link). Text in 3D:
  none, except ASCII digits 1-5 for generation numbers. Symbols instead of words.
- Visual codes (keep constant in all shots):
  * SHEEP / LAMB = stef_35 sheep model (lamb = scale 0.55). A GENERATION = one sheep standing on a round STONE PLINTH with a
    floating ASCII digit (1..5) above it. Generations stand in a row left->right, each next one smaller/younger.
  * GENTILE OWNER = NOT a person: a dark slate-blue POST/peg with a round iron ring on top (the "owner's peg"), left side.
  * LIEN = an IRON CHAIN (row of dark grey torus links) from the peg to a sheep's collar; links clink/sway. A held sheep
    has the chain; a FREE sheep has no chain (the chain link snaps open / dissolves with a small puff).
  * GUARANTEE = a small iron anvil-shaped block / iron coin stack near the peg, never shrinking (the capital that does not break).
  * HOLY FIRSTBORN = soft GOLD glow ring under the lamb + gold sparkles rising + green check. NOT HOLY = no gold, small red X.
  * SEIZE = the chain tightens and the sheep slides a step toward the peg.
  * DISPUTE = two balance pans / two coloured flags (teal for one view, orange for the other) over generation 4, one with
    gold sparkle, the other with red X.

## Art direction (owner order 26/10/2026)
Clean bright flat-explainer look rendered in 3D: soft toon materials, 4-5 colours per shot, lots of clean space, simple
sky backdrop, smooth motion, gentle camera moves, real depth (foreground grass edge / mid meadow / far soft hills,
parallax). Palette: sky #CFE6F2, meadow #9CCB7A, stone #E8D9B5, wool #F6F2E8, iron #4A5560, peg slate #3E5878,
gold #E8B830, red #C2453A, green #4FA35A. Warm near-white key light. Every shot moves; frame 0 never empty; hero visible
within 3 s.

## The central visual idea
ONE row of generations on stone plinths, and ONE iron chain from the owner's peg. The chain reaches down the row
generation after generation and then ENDS - and the first lamb beyond the chain's reach glows gold.

## STORYBOARD (time = local seconds inside the shot)
| shot | dur | idea (caption IDs) | what the OBJECTS do + camera | character | viewer learns |
|---|---|---|---|---|---|
| s01 | 7.65 | title | Meadow; the owner's peg on the left; a chain runs from it to a sheep on plinth "1"; a small lamb beyond the chain sparkles faintly gold. Camera: slow crane down from high 3/4. | none | subject: chain from an owner, sheep, holy lamb |
| s02 | 16.93 | what is iron flock: Jew raises the sheep, guarantees their value (CAP_s02_1, _2) | A flock of 4 sheep walks from the peg side to a cosy pen (wooden fence) on the right; the iron guarantee block stays by the peg. At 2nd caption one sheep in the pen fades away (as if lost) and an iron coin stack slides from the pen back to the peg - the guarantee block stays full size, gleams. Camera: lateral truck following the flock. | none | value is always paid back |
| s03 | 13.15 | firstborn holy only when no gentile share (CAP_s03_1, _2) | Two ewes side by side, each with a newborn lamb. Left ewe has a thin iron link on its collar connected to the peg; right ewe free. At 2nd caption right lamb gets gold ring + green check; left lamb gets small red X. Camera: slow push-in between them. | none | gentile share = not holy |
| s04 | 16.39 | the key word: seizing (CAP_s04_1, _2) | Peg with chain to a grazing sheep. At 2nd caption the chain tightens, the sheep slides one step toward the peg (seized), then relaxes; a pulse of slate light runs along the chain. Camera: medium, gentle drift. | none | the gentile can seize = has a share |
| s05 | 11.86 | mishna quote (CAP_s05_1) | Calm: row of plinths 1-2-3 with sheep; the chain glows softly along 1 and 2; slow light motes. Camera: slow orbit 15 deg. | none | the mishna speaks about generations |
| s06 | 14.77 | the question: how many generations? (CAP_s06_1, _2) | Chain from peg to sheep 1; digits 1..4 float over empty plinths; at 2nd caption a '?' -shaped glow is NOT allowed (no text) - instead: the chain's free end lifts and probes toward plinth 2, 3, 4 in turn, each plinth lighting up briefly. Camera: low, truck along the row. | none | how far does the chain reach |
| s07 | 18.55 | CLIP HOLD (CAP_s07_1.._4) | Clip covers x160-1760 y20-920 for 0-18.0 s. Calm soft backdrop (sky, distant hills, drifting light motes, slow parallax at far edges). Nothing important in the centre. Camera almost still. | none | (clip: generations boards) |
| s08 | 16.93 | what we saw: gen 1-2 held, gen 3 free, its firstborn gen 4 holy (CAP_s08_1, _2) | Row 1-2-3-4. Chain from peg links sheep 1 and 2 (they sway on it). Sheep 3: the chain reaches toward it but the last link snaps open with a puff; at 2nd caption lamb 4 pops up beside 3 with gold ring + sparkles + green check. Camera: slow truck left->right ending on lamb 4. | none | the chain ends; next firstborn is holy |
| s09 | 13.69 | trick: young instead of mothers (CAP_s09_1, _2) | Peg chained to mother 1. A lamb slides from plinth 2 to stand by the peg; at 2nd caption the chain unhooks from the mother (mother brightens, free) and hooks onto the lamb; the whole chain visibly shifts one plinth to the right. Camera: medium, slight rise. | none | chain shifts one generation |
| s10 | 27.55 | CLIP HOLD (CAP_s10_1.._5) | Same calm backdrop as s07 (reuse). | none | (clip: shifted chain, gen 5 holy) |
| s11 | 16.93 | dispute Rav Huna / Rav Yehuda (CAP_s11_1, _2) | Row 1-4; chain on 1-2; over plinth 4 two flags rise: teal flag with gold sparkle on lamb 4, orange flag where a SECOND, longer, ghostly translucent chain stretches to 3 and 4 and a red X appears. Lamb 4 alternates gold/plain gently. Camera: slow push-in to plinth 4. | none | they disagree how long the chain is |
| s12 | 38.05 | CLIP HOLD (CAP_s12_1.._5) | Same calm backdrop as s07 (reuse). | none | (clip: gen 4 dispute) |
| s13 | 20.53 | QUESTION 1 (CAP_s13_1; think 6.1-12.1; CAP_s13_2 answer) | Pen with a sheep cared for (a small water trough, hay), but a thin chain from the peg to it; clock ring floats above, fills 6.1-12.1. Answer: the chain glows, tightens one pulse, newborn lamb shows red X. Camera: slow drift. | none | care does not remove the gentile's share |
| s14 | 18.86 | QUESTION 2 (CAP_s14_1; think 4.9-10.9; CAP_s14_2 answer) | Row of plinths with chain on 1-2; clock ring 4.9-10.9. Answer: lamb swap animation (as s09, quicker) - chain shifts one plinth right, digits under the chain highlight. Camera: high 3/4, gentle drift. | none | the chain moves one generation |
| s15 | 18.25 | SUMMARY (CAP_s15_1 / _2, about 9 s each) | One continuous glide along the row: peg + guarantee block -> chained gen 1-2 -> snapped link at 3 -> gold lamb 4 with the two flags above. | none | recap |
| s16 | 7.45 | credits (CAP_s16_1) | Calm wide of the meadow at golden evening light, flock grazing free, the peg far away, light motes. | none | end |

## Done condition
`python tools/verify_scene.py productions/stef_36/film_a.html --out productions/stef_36/_verify --timeout 900` = PASS (zero
P0/P1), report copied to `productions/stef_36/VERIFY_REPORT.json`. Batch fixes, one full verify. Also render stills (JPG) at
absolute times 5,20,32,45,60,75,108,122,165,220,240,260 with
`PYTHONIOENCODING=utf-8 python tools/stills.py productions/stef_36/film_a.html productions/stef_36/_stills --times 5,20,32,45,60,75,108,122,165,220,240,260 --fmt jpg --size 960x540 --timeout 900`
for the supervisor. No full render. NEVER Read a PNG (use `python tools/safe_view.py <dir> --out <dir2> --sheet 4` and read
only CLEAN jpgs if you must look). Never put Hebrew in code or chat; captions only as vault IDs.
