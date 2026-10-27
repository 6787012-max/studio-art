# stef_34 - "The owners add a fifth" (chomesh bealim) - 3D graphics layer for a concept video

## What this film is
A 213.95 s silent 3D picture (1920x1080, 30 fps) that becomes the GRAPHICS LAYER of a lesson video. Later, locally, two
animation clips of another studio are laid OVER shots s05 (0-44.8 s) and s07 (0-36.4 s) (rectangle x160-1760, y20-920) and
music is mixed in. Nothing of those clips is in this folder or in this code. The video plays in a school lobby WITHOUT SOUND:
every shot must explain its idea by what the objects DO; the caption (vault ID) is the words.

Topic (for you, English only): a person consecrated an (unclean) animal to the Temple treasury. It can be redeemed with
money; the money goes to the treasury. Anyone may redeem it, but the ORIGINAL OWNER has first right, because an owner who
redeems must ADD A FIFTH: value 100 -> he pays 125 (the added 25 is one fifth of the total 125). Someone else pays only 100.
So the treasury gains more when the owner redeems. The same "owner adds a fifth" applies to a consecrated house or field.

Read: `~/.claude/skills/video-production/references/builder_kit.md` (engine rules), this file, `timeline.json` (locked shot
durations + capAt) and `shots.ids.md` (shot table). Closest finished example: `productions/stef_33/` (`BRIEF.md`,
`film_a.html`, `il.js`, `render.json`). COPY stef_33's page structure, its clip-hold backdrop shots, its clock ring and
question-shot pattern, its ground/sky/hills setup; then build the new objects. Write `productions/stef_34/film_a.html` and a
shared module `productions/stef_34/ch.js`; copy `stef_33/render.json` to `stef_34/render.json` (adjust includes: ch.js
instead of il.js, plus any assets you use).

## Hard technical contract
- `film({title:'TITLE', kicker:'KICKER', vault:'captions_vault.json', shots:[...]})` - NO recap, so `__dur` must equal
  exactly 213.95 (sum of timeline.json shot durations). Shots s01..s13 in order, each `dur` = timeline.json value, `caps` =
  caption IDs of that shot in order, `capAt` = timeline.json capAt of that shot. s01 has no caps (title card overlays 0-4.2 s).
- Captions sit in the bottom band (about y 0.78H-0.95H). Keep every key action in the upper 75% of the frame.
- Deterministic (function of t only), toon + ink house style, `Wd.hero = <main object>` in every shot.
- NO people, no hands. "Owner" = BLUE: a blue pawn token (cylinder body + ball head, like a board-game piece, about the
  donkey's knee height) and a blue tag/ribbon on the donkey's neck. "Someone else" = ORANGE pawn token. Pawns slide/hop,
  they never look like humans.
- The consecrated animal: CC0 donkey `quaternius-showcase/animals_pack/Donkey.glb` (find it via
  `python tools/assetlib.py search donkey`; copy into `productions/stef_34/assets/`; use an Idle/Eating/Walk clip via
  glb3d.js). A soft GOLD glow ring under its hooves = "consecrated". If the GLB fails, a simple toon donkey from shapes.
- Coins: flat gold cylinders (`cyl`) stacked into COLUMNS. One column = 25. Value 100 = FOUR equal columns side by side.
  The added fifth = a FIFTH equal column with a brighter gold glow. ASCII digits only as 3D/billboard text: "25", "100",
  "125", "1/5". No other text in 3D.
- Treasury chest: a sturdy wooden chest (#8A5A3B) with gold trim (#E0B040) on a light stone platform; lid opens; coins
  slide in. Optional transparent "jar" twins (glass cylinders) to compare amounts (fill levels).

## Art direction (owner order 26/10/2026)
Clean bright flat-explainer look rendered in 3D: soft toon materials, 4-5 colours per shot, lots of clean space, simple
sky backdrop, smooth motion, gentle camera moves, real depth (foreground stone edge / mid platform / far soft hills, parallax).
Palette: sky #CFE6F2, stone #E8D9B5, chest wood #8A5A3B, gold #E8B830, owner blue #3F7FD0, other orange #E08A3A,
red X #C2453A, green check #4FA35A. Warm near-white key light. Every shot moves; frame 0 never empty; hero visible within 3 s.

## The central visual idea
ONE stone platform in front of the treasury chest. The value of the animal is ALWAYS four gold columns; the owner's fifth
column is the bright extra one. Blue = owner, orange = someone else. Build once in `ch.js`: `platform()`, `chest(open)`,
`donkey(glow)`, `pawn(color)`, `coinColumns(n, grow, opts)` (columns rise coin by coin), `fifthColumn(p)`,
`slideInto(chest, cols, p)`, `jar(level)`, `lanes()` (two short lanes with rope posts leading to the chest, a small gate on
the blue lane), `numberTag(text)`, `xMark()`, `checkMark()`, `clockRing()` (copy from stef_33), `house()`, `fieldPlot()`.

## STORYBOARD (time = local seconds inside the shot)
| shot | dur | idea (caption IDs) | what the OBJECTS do + camera | character | viewer learns |
|---|---|---|---|---|---|
| s01 | 7.65 | title | Platform with the chest; the donkey stands beside it with the gold consecrated glow under it; coins sparkle on the chest lid. Camera: slow crane down from high 3/4. | none | subject: consecrated animal + treasury |
| s02 | 9.43 | verse: if he redeems it, he adds its fifth (CAP_s02_1) | In front of the donkey four coin columns rise ("100" floats above); at ~5 s a fifth bright column rises beside them, "125" replaces "100". Camera: slow lateral truck. | none | redeeming + an added fifth |
| s03 | 10.45 | consecrated to the Temple upkeep; can be redeemed with money that goes to the treasury (CAP_s03_1, _2) | Donkey on platform with gold glow. At 2nd caption four columns slide into the open chest, the gold glow ring moves OFF the donkey onto the chest (holiness passes to the money), donkey glow gone, it walks a few steps away free. Camera: gentle push-in. | none | money replaces the animal |
| s04 | 9.91 | anyone can redeem - but the owners come first (CAP_s04_1, _2) | Two lanes to the chest: several ORANGE pawns in the right lane, one BLUE pawn in the left lane. At 2nd caption the blue gate swings open, the blue pawn slides up to the chest first; orange pawns wait behind the rope. Camera: high 3/4, slow drift. | none (pawns are tokens) | owners first |
| s05 | 45.35 | CLIP HOLD (CAP_s05_1.._6) | Clip covers x160-1760 y20-920 for 0-44.8 s. Calm soft backdrop (sky, distant hills, drifting light motes, slow parallax at far edges). Nothing important in the centre. Camera: almost still. | none | (the clip explains) |
| s06 | 11.53 | what is a fifth: a fifth of the total; add 25 to 100 = 125 (CAP_s06_1, _2) | Four columns, each tagged "25", "100" above. Fifth bright column rises, "125" above all five. At 2nd caption a bracket/light outline highlights ONE column of the FIVE and "1/5" pops above it. Camera: slow orbit 20 deg. | none | fifth = one of five equal parts |
| s07 | 36.95 | CLIP HOLD (CAP_s07_1.._5) | Same calm backdrop as s05 (reuse). | none | (the clip explains) |
| s08 | 9.91 | why owners first? they add a fifth, the treasury gets more (CAP_s08_1, _2) | Two glass jars side by side: orange pawn by the left jar, blue pawn by the right. Coins pour in: orange jar fills 4 levels ("100"), blue jar fills 5 levels ("125"); at 2nd caption the blue jar glows and a check mark pops. Camera: slow push-in. | none | treasury gains more from owner |
| s09 | 13.15 | also house and field: owners add a fifth (CAP_s09_1, _2) | A small toon house (left) and a green field plot (right), each with a blue flag. In front of each, four columns rise, then a bright fifth column. Camera: slow lateral truck from house to field. | none | same rule for house/field |
| s10 | 18.18 | QUESTION 1 (CAP_s10_1; think 6.1-11.1; CAP_s10_2 answer) | Donkey with BLUE tag (its owner) and an ORANGE pawn approaching the chest. Clock ring floats above, ring fills 6.1-11.1. Answer: orange pawn pushes only FOUR columns into the chest; the bright fifth column greys and sinks, small red X over it. Camera: slow drift. | none | other pays 100, no fifth |
| s11 | 15.74 | QUESTION 2 (CAP_s11_1; think 3.6-8.6; CAP_s11_2 answer) | The two jars again (empty); clock ring 3.6-8.6. Answer: jars fill (orange 4 levels, blue 5 levels), blue jar glows, check mark. Camera: low wide, gentle rise. | none | treasury prefers owner |
| s12 | 18.25 | SUMMARY (CAP_s12_1 / _2, about 9 s each) | One continuous glide: (1) blue gate opens, blue pawn first, four + bright fifth column slide into the chest; (2) orange pawn's four columns only; the jars compare, blue higher. | none | recap |
| s13 | 7.45 | credits (CAP_s13_1) | Calm wide of the platform and chest at golden evening light, donkey grazing at the side, light motes. | none | end |

## Done condition
`python tools/verify_scene.py productions/stef_34/film_a.html --out productions/stef_34/_verify --timeout 900` = PASS (zero
P0/P1), report copied to `productions/stef_34/VERIFY_REPORT.json`. Batch fixes, one full verify. Also render stills (JPG) at
absolute times = shot start + local: s01 5.5, s02 7, s03 8, s04 8, s06 9, s08 8, s09 10, s10 15, s12 13 with
`PYTHONIOENCODING=utf-8 python tools/stills.py productions/stef_34/film_a.html productions/stef_34/_stills --times ... --fmt jpg --size 960x540 --timeout 900`
for the supervisor. No full render. NEVER Read a PNG (use `python tools/safe_view.py <dir> --out <dir2> --sheet 4` and read
only CLEAN jpgs if you must look). Never put Hebrew in code or chat; captions only as vault IDs.
