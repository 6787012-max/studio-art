# stef_33 - "One who buys three trees" (shlosha ilanot) - 3D graphics layer for a concept video

## What this film is
A 185.92 s silent 3D picture (1920x1080, 30 fps) that becomes the GRAPHICS LAYER of a lesson video. Later, locally, two
animation clips of another studio are laid OVER shots s05 (0-12.4 s) and s09 (0-12.0 s) (rectangle x160-1760, y20-920) and
music is mixed in. Nothing of those clips is in this folder or in this code. The video plays in a school lobby WITHOUT SOUND:
every shot must explain its idea by what the objects DO; the caption (vault ID) is the words.

Read: `~/.claude/skills/video-production/references/builder_kit.md` (engine rules), this file, `timeline.json` (locked shot
durations + capAt) and `shots.ids.md` (shot table). Closest finished example: `productions/stef_32/` (`BRIEF.md`,
`film_a.html`, `mk.js`, `render.json`). COPY stef_32's page structure, its clip-hold backdrop (s05/s09 there), its clock
ring and its question-shot pattern, its ground/sky/hills setup; then build the new objects. Write
`productions/stef_33/film_a.html` and a shared module `productions/stef_33/il.js`; copy `stef_32/render.json` to
`stef_33/render.json` (adjust includes: il.js instead of mk.js, plus any assets you use).

## Hard technical contract
- `film({title:'TITLE', kicker:'KICKER', vault:'captions_vault.json', shots:[...]})` - NO recap, so `__dur` must equal
  exactly 185.92 (sum of timeline.json shot durations). Shots s01..s14 in order, each `dur` = timeline.json value, `caps` =
  caption IDs of that shot in order, `capAt` = timeline.json capAt of that shot. s01 has no caps (title card overlays 0-4.2 s).
- Captions sit in the bottom band (about y 0.78H-0.95H). Keep every key action in the upper 75% of the frame.
- Deterministic (function of t only), toon + ink house style, `Wd.hero = <main object>` in every shot.
- NO people, no hands. The two owners are shown only as COLOURED LAND / MARKERS: the field = "Shimon" = green meadow plot
  with a small GREEN flag at its corner; the buyer "Reuven" = a small BLUE flag / blue ribbon ring tied around the trunk of
  each tree he owns. Ownership of ground = the soil/grass patch under the trees turns BLUE-tinted (with a soft blue
  outline drawn around it). No text in 3D except ASCII digits (1 2 3 may float above trees when counting).
- Trees from engine shapes (`cyl` trunk brown, 2-3 `ball` crowns green, toon) are right; optional CC0 tree props
  (`python tools/assetlib.py search tree --cat nature`) copied into `productions/stef_33/assets/`. Roots = thin brown
  cylinders spreading underground, shown in a CUTAWAY: the ground is a thick slab whose front face is cut so we see brown
  soil and the roots inside it (like a cross-section diagram). New shoots = small green saplings (thin trunk + small ball)
  that grow (scale 0->1) out of the ground above a root, or out of the side of the trunk.

## Art direction (owner order 26/10/2026)
Clean bright flat-explainer look rendered in 3D: soft toon materials, 4-5 colours, lots of clean space, simple sky backdrop,
smooth motion, gentle camera moves, real depth (foreground grass tufts / mid field / far soft hills, parallax).
Palette: sky #CFE6F2, meadow green #7FB86A, tree crown #4F9A4A, trunk/roots #8A5A3B, soil #A9784F, Reuven blue #3F7FD0,
accent red #C2453A (only for the X / "no" mark). Warm near-white key light. Every shot moves; frame 0 never empty; the hero
object visible within 3 s.

## The central visual idea
ONE green field (Shimon's, green flag) seen in 3/4 high view, with a cutaway front edge showing soil. Reuven's trees are
marked with blue ribbons. The SAME field in every shot; the number of trees (2 or 3) and the colour of the ground under
them tell the law. Build once in `il.js`: `field()` (meadow slab with cutaway soil front, green corner flag), `tree(x,z,grow)`,
`ribbon(tree)` (blue ring on trunk), `roots(tree, spread)` (underground roots grow outward in the cutaway),
`shootFromRoot(x,z,p)`, `shootFromTrunk(tree,p)`, `blueGround(points, p)` (blue-tinted patch + outline under and between the
trees spreads in), `wither(tree,p)` (crown shrinks/greys and falls, trunk sinks away, ribbon drops), `xMark()`, `checkMark()`,
`clockRing()` (copy from stef_32).

## STORYBOARD (time = local seconds inside the shot)
| shot | dur | idea (caption IDs) | what the OBJECTS do + camera | character | viewer learns |
|---|---|---|---|---|---|
| s01 | 7.65 | title | Green field with green flag; from 1 s three trees grow up out of the ground one after another (digits 1 2 3 pop above them, then fade). Camera: slow crane down from high 3/4. | none | the subject: trees in a field |
| s02 | 15.51 | Mishna quote: two trees - no land; three - land (CAP_s02_1) | Left half of field: 2 trees with blue ribbons, the ground under them stays green and a small red X blinks above it at 5 s. At 8 s camera pans right: 3 trees with blue ribbons, the ground under and BETWEEN them turns blue (patch spreads in, outline draws), a check mark pops at 11 s. Camera: slow lateral truck left->right. | none | 2 trees no land, 3 trees land |
| s03 | 13.15 | the situation: Reuven buys trees in Shimon's field (CAP_s03_1, _2) | Field with green flag waving; two trees in it; blue ribbons tie themselves around both trunks (ownership moves to the trees only). At the 2nd caption a glowing "?" made of... NO text - instead the ground under the trees pulses softly white twice (the question: whose ground?). Camera: gentle push-in. | none | trees bought, ground is the question |
| s04 | 12.07 | two trees: no land; he has only the trees (CAP_s04_1, _2) | Two ribboned trees; a blue patch tries to spread under them, flickers and shrinks back to nothing; red X appears above the ground; the green flag rises taller (ground stays Shimon's). Camera: slow orbit 25 deg. | none | two trees = trees only |
| s05 | 12.95 | CLIP HOLD (CAP_s05_1, _2) | Clip covers x160-1760 y20-920 for 0-12.4 s. Calm soft backdrop (sky, distant hills, drifting light motes, slow parallax of grass tufts at far left/right edges). Nothing important in the centre. Camera: almost still drift. | none | (the clip explains) |
| s06 | 12.07 | from the trunk - his; from the roots - the field owner's (CAP_s06_1, _2) | CUTAWAY view, one ribboned tree (of a pair). At ~1 s a shoot grows out of the TRUNK side and gets a blue ribbon. At the 2nd caption roots spread underground and a sapling grows out of the ground above a root a short distance away - it gets a GREEN flag (Shimon's). Camera: low side view, slow rise. | none | trunk shoot vs root shoot |
| s07 | 10.45 | two trees that died: no land (CAP_s07_1, _2) | Two ribboned trees wither (crowns shrink and grey, fall), trunks sink away, ribbons drop; the empty ground stays plain green, green flag waves; small red X. Camera: slow push-in. | none | trees gone = nothing left |
| s08 | 11.53 | three trees: land; under and between them is his (CAP_s08_1, _2) | A third tree grows to join the pair (digit 3 pops). At the 2nd caption a blue patch spreads under and BETWEEN the three trees (triangle area), blue outline draws around it, a blue flag plants itself in the middle. Camera: crane up to a higher view to see the triangle. | none | three trees = the ground too |
| s09 | 12.55 | CLIP HOLD (CAP_s09_1, _2) | Same calm backdrop as s05 (reuse). | none | (the clip explains) |
| s10 | 12.07 | three trees: everything is his; if they die the land stays his (CAP_s10_1, _2) | Blue triangle field with three trees; a shoot from a trunk AND a sapling from a root both grow and both get blue ribbons. At the 2nd caption the three trees wither and vanish - but the blue ground patch and blue flag STAY, and a small new sapling is planted in it. Camera: slow arc. | none | three trees - all his, land remains |
| s11 | 22.00 | QUESTION 1 (CAP_s11_1 question; think 8.1-13.1; CAP_s11_2 answer) | Two ribboned trees + a root sapling rising between. Clock ring floats above, its ring fills during 8.1-13.1. Answer: the sapling gets a GREEN flag (Shimon's), red X over blue. Camera: slow drift. | none | root shoot with 2 trees = field owner's |
| s12 | 18.22 | QUESTION 2 (CAP_s12_1; think 5.7-10.7; CAP_s12_2 answer) | Three ribboned trees wither and vanish; clock ring countdown during 5.7-10.7. Answer: the blue ground patch glows and stays, blue flag plants, check mark. Camera: low wide, gentle rise. | none | 3 trees died - land stays |
| s13 | 18.25 | SUMMARY (CAP_s13_1 / _2, about 9 s each) | One continuous glide: (1) two trees, ground stays green, root sapling gets green flag; (2) three trees, blue triangle ground spreads, trees fade but blue ground stays. | none | recap |
| s14 | 7.45 | credits (CAP_s14_1) | Calm wide of the field at golden evening light, three trees sway gently, light motes. | none | end |

## Done condition
`python tools/verify_scene.py productions/stef_33/film_a.html --out productions/stef_33/_verify --timeout 900` = PASS (zero
P0/P1), report copied to `productions/stef_33/VERIFY_REPORT.json`. Batch fixes, one full verify. Also render stills (JPG) at
absolute times = shot start + local: s01 5.5, s02 12, s04 9, s06 9, s08 9, s10 9, s11 17, s13 13 with
`tools/stills.py ... --fmt jpg --size 960x540` into `productions/stef_33/_stills` for the supervisor. No full render.
NEVER Read a PNG. Never put Hebrew in code or chat; captions only as vault IDs.
