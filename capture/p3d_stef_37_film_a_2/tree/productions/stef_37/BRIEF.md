# stef_37 - "Lashes" (malkot) - 3D graphics layer for a concept video

## What this film is
A 302.40 s silent 3D picture (1920x1080, 30 fps) that becomes the GRAPHICS LAYER of a lesson video. Later, locally, seven
animation clips of another studio are laid OVER the clip shots (s07, s08, s10, s12, s13, s16, s17; rectangle x160-1760,
y20-920, times in `shots.ids.md`) and music is mixed in. Nothing of those clips is in this folder or in this code. The
video plays in a school lobby WITHOUT SOUND: every shot must explain its idea by what the objects DO; the caption (vault
ID) is the words.

Topic (English only, for you): the mishna "these are the ones who receive lashes". A Jewish court (beit din) gives
lashes to a person who broke a Torah prohibition by an ACTION, in front of WITNESSES, after being WARNED. The verse says
"forty he shall strike him" and the sages read it as forty minus one = 39. Many items in the mishna's list are FORBIDDEN
FOODS. The video shows four: (1) CHELEV - certain fat of cattle, sheep and goats (not milk!); its punishment is karet,
and the Talmud asks whether someone liable karet also gets lashes - the tannaim disagree; (2) BLOOD of animals and birds;
(3) INSECTS / creeping things - even one tiny whole insect is forbidden, so we CHECK leafy vegetables (lettuce);
(4) TEVEL - produce from which terumot and maaserot were not yet separated: the farmer gives a tenth (maaser) to the
Levi, and the Levi must give a tenth of THAT to the kohen (terumat maaser) before eating. Amount: an olive's bulk
(kezayit) per the sages; a whole insect even if tiny.

Read: `~/.claude/skills/video-production/references/builder_kit.md` (engine rules), this file, `timeline.json` (locked
shot durations + capAt) and `shots.ids.md` (shot table). Closest finished example: `productions/stef_36/` (`BRIEF.md`,
`film_a.html`, `tz.js`, `render.json`) and `productions/stef_35/` - clip-hold backdrop shots, the clock-ring question
pattern, red X / green check billboards, coin/stack objects, plinths. COPY stef_36's page structure, then build the new
objects. Write `productions/stef_37/film_a.html` and a shared module `productions/stef_37/mk.js`; copy
`stef_36/render.json` to `stef_37/render.json` (adjust includes: mk.js instead of tz.js, plus any assets you use).

## Hard technical contract
- `film({title:'TITLE', kicker:'KICKER', vault:'captions_vault.json', shots:[...]})` - NO recap, so `__dur` must equal
  exactly 302.40 (sum of timeline.json shot durations). Shots s01..s23 in order, each `dur` = timeline.json value, `caps` =
  caption IDs of that shot in order, `capAt` = timeline.json capAt of that shot. s01 has no caps (title overlays 0-4.2 s).
- Captions sit in the bottom band (about y 0.78H-0.95H). Keep every key action in the upper 75% of the frame.
- Deterministic (function of t only), toon + ink house style, `Wd.hero = <main object>` in every shot.
- NO people, no hands, no whip, no body, no violence, no gore. Lashes are shown ONLY as abstract counting: 39 small
  tally beads/marks. Actions are done by objects themselves (things slide, float, pop, glow, stack). Text in 3D: none,
  except ASCII digits (39, 40, 1-4, 10). Symbols instead of words.
- Visual codes (keep constant in all shots):
  * COURT = three tall dark-wood high-back chairs behind a long table on a low stone dais (empty chairs, no people), a
    soft warm lamp above. Reused wherever "beit din" is meant.
  * WITNESSES = two small upright stone tablets/posts with a round "eye-like" lens disc on top (abstract), left of court.
  * WARNING = a small bell that rings (swings, rings of light).
  * PROHIBITION = a round sign-ring floating over a food: white disc with red outline; when forbidden a red diagonal bar
    swipes across it. ALLOWED = green check.
  * LASH COUNT = a row of 40 tally beads on a thin rod; at the key moment the 40th bead pops off and floats away,
    39 remain and glow; digits "40" morph to "39".
  * CHELEV = a creamy-white glossy slab of fat (soft wobbly block, slightly translucent) on a wooden board, next to a
    plain lean red-brown meat cut (allowed). A tall glass of milk nearby with a green check (milk is fine) - chelev slab
    gets the red bar.
  * KARET / severe = a dark slate cut-line/scissor-less "gap" shape: a glowing thread that snaps (abstract), use sparingly.
  * BLOOD = a stylised deep-red DROP shape (smooth, symbol only) over a bowl; red bar swipes across.
  * INSECT = a small cute stylised ant (shape-built: 3 spheres + thin legs), and leafy LETTUCE heads (layered green leaves).
    A magnifying LENS (ring + glass disc) slides over leaves and reveals a tiny ant, which gets the red bar.
  * TEVEL = a heap of red fruit (pomegranates/grapes as spheres) on a cart. MAASER = 1 of 10 crates slides from the
    farmer's side (a straw-hat on a peg = farmer symbol, no person) to the LEVI's side (a white-and-blue basket on a pedestal);
    TERUMAT MAASER = from the Levi basket 1 of 10 fruits rises and floats to the KOHEN's side (a small gold-trimmed white
    tray on a pedestal). Digits 10 above the stacks. Untithed heap = dull + red bar; after separation = bright + green check.
  * KEZAYIT = one olive (dark green ellipsoid) on a small scale pan, balancing a food piece of the same size.

## Art direction (owner order 26/10/2026)
Clean bright flat-explainer look rendered in 3D: soft toon materials, 4-5 colours per shot, lots of clean space, simple
backdrop, smooth motion, gentle camera moves, real depth (foreground edge / mid stage / soft far backdrop, parallax).
Palette: backdrop #E9E2D3 (warm parchment), stone #D8C9A8, dark wood #6B4A32, red #C2453A, green #4FA35A,
gold #E8B830, fat cream #F3EBD3, lettuce #7DBA5A, sky-blue accents #CFE6F2. Warm near-white key light. Every shot moves;
frame 0 never empty; hero visible within 3 s.

## The central visual idea
ONE floating PROHIBITION sign-ring that travels from food to food across the film (fat -> blood drop -> ant -> untithed
heap), swiping its red bar over each, while the 39 lash beads stand by the empty court as the consequence.

## STORYBOARD (time = local seconds inside the shot)
| shot | dur | idea (caption IDs) | what the OBJECTS do + camera | character | viewer learns |
|---|---|---|---|---|---|
| s01 | 7.65 | title | Empty court on dais, lamp glows; in front float four small foods (fat slab, red drop, ant, fruit heap) under the prohibition ring; the 39 bead rod glints. Camera: slow crane down. | none | subject: court + forbidden foods |
| s02 | 15.85 | what is malkot: action, witnesses, warning -> court (CAP_s02_1, _2) | A fruit/food piece is "taken" (slides off a table by itself = the action); the two witness posts light their lenses; the bell swings and rings; at 2nd caption the three conditions (action icon, witness posts, bell) glide together toward the court and the court lamp brightens; bead rod appears. Camera: lateral truck to the court. | none | 3 conditions -> court |
| s03 | 7.88 | verse "forty he shall strike" (CAP_s03_1) | Bead rod with 40 beads; digits "40" float above, glowing softly; a scroll-like parchment roller (no text) unrolls behind. Camera: slow push-in. | none | the verse says forty |
| s04 | 11.53 | 39 = forty minus one (CAP_s04_1, _2) | At 2nd caption the 40th bead pops off and floats away, "40" morphs to "39", the 39 beads glow gold one after another. Camera: slow orbit 15 deg. | none | it is 39 |
| s05 | 13.69 | the mishna list, many are foods (CAP_s05_1, _2) | A long table/tray slides in with many covered dishes (domes); at 2nd caption four domes lift showing fat, drop, ant, fruit heap; the prohibition ring hovers above them. Camera: truck along the table. | none | many items are foods; we meet four |
| s06 | 12.61 | 1: chelev, fat - not milk (CAP_s06_1, _2) | Board with creamy fat slab and lean meat; glass of milk. Ring moves over fat -> red bar; at 2nd caption the milk glass gets a green check, the fat keeps the red bar. Digit 1 floats. Camera: slow push-in. | none | chelev is fat, forbidden; milk is not it |
| s07 | 12.55 | CLIP HOLD (CAP_s07_1, _2) | Calm warm backdrop (soft parchment, drifting light motes, slow parallax at far edges). Nothing important in centre. Camera almost still. | none | (clip: fat cooked) |
| s08 | 37.55 | CLIP HOLD (CAP_s08_1.._4) | Same calm backdrop (reuse). | none | (clip: chelev burger, karet question) |
| s09 | 13.69 | 2: blood (CAP_s09_1, _2) | A bowl; a smooth red drop descends into view above it; ring swipes red bar; at 2nd caption small icons of a cow-head silhouette shape (simple shapes, toon), a deer-antler shape and a bird shape float around the drop, each linking to it with a thin red line. Digit 2. Camera: gentle drift. | none | blood of animal, beast, bird forbidden |
| s10 | 19.55 | CLIP HOLD (CAP_s10_1.._3) | Same calm backdrop (reuse). | none | (clip: blood) |
| s11 | 11.53 | 3: insects, even one tiny (CAP_s11_1, _2) | Lettuce head; a tiny ant walks on a leaf; at 2nd caption the ring shrinks to ant size and swipes the red bar on that single ant. Digit 3. Camera: push-in macro. | none | even one small insect forbidden |
| s12 | 5.65 | CLIP HOLD (CAP_s12_1) | Same calm backdrop (reuse). | none | (clip: bugs in salad) |
| s13 | 7.15 | CLIP HOLD (CAP_s13_1) | Same calm backdrop (reuse). | none | (clip: ant on spoon) |
| s14 | 10.45 | what we do: check vegetables (CAP_s14_1, _2) | Lettuce leaves fan out one by one; the magnifying lens slides over each leaf; on one leaf it reveals an ant which is lifted away (floats off); at 2nd caption the leaves stack clean and get a green check. Camera: slow drift. | none | we check leafy greens |
| s15 | 11.53 | 4: tevel (CAP_s15_1, _2) | Cart with dull fruit heap and red bar; at 2nd caption tiny empty slots (one gold tray, one blue basket) glow beside it, showing what is still missing. Digit 4. Camera: slow push-in. | none | untithed produce forbidden until separated |
| s16 | 5.55 | CLIP HOLD (CAP_s16_1) | Same calm backdrop (reuse). | none | (clip: farmer -> Levi) |
| s17 | 8.85 | CLIP HOLD (CAP_s17_1) | Same calm backdrop (reuse). | none | (clip: Levi -> kohen) |
| s18 | 12.61 | the Levi too: terumat maaser (CAP_s18_1, _2) | Levi basket with 10 fruits, digit 10; one fruit rises and floats to the kohen gold tray; at 2nd caption the remaining 9 brighten with green check; a replay: before the fruit left, a ghost red bar over the basket. Camera: truck from basket to tray. | none | Levi gives a tenth before eating |
| s19 | 12.61 | how much: kezayit; whole insect even tiny (CAP_s19_1, _2) | Small balance scale: olive in one pan, food piece in other, they balance and glow; at 2nd caption a tiny ant appears on a separate tiny pan, far lighter, still gets the red bar. Camera: slow orbit. | none | olive size; whole insect any size |
| s20 | 18.95 | QUESTION 1 (CAP_s20_1; think 4.0-10.1; CAP_s20_2 answer) | Lettuce head under the clock ring that fills 4.0-10.1; answer: the lens finds an ant, red bar on it. Camera: slow drift. | none | why check lettuce |
| s21 | 19.27 | QUESTION 2 (CAP_s21_1; think 5.3-11.3; CAP_s21_2 answer) | Levi basket with 10 fruits under the clock ring 5.3-11.3; answer: one fruit floats to the kohen tray, rest get green check. Camera: high 3/4 drift. | none | Levi separates terumat maaser |
| s22 | 18.25 | SUMMARY (CAP_s22_1 / _2) | One continuous glide: court + 39 beads -> fat slab & red drop with red bars -> lettuce with lens & ant -> fruit heap -> tray & basket with green check. | none | recap |
| s23 | 7.46 | credits (CAP_s23_1) | Calm wide: court in soft evening light, clean lettuce and tithed fruit on the table, light motes. | none | end |

## Done condition
`python tools/verify_scene.py productions/stef_37/film_a.html --out productions/stef_37/_verify --timeout 900` = PASS (zero
P0/P1), report copied to `productions/stef_37/VERIFY_REPORT.json`. Batch fixes, one full verify. Also render stills (JPG) at
absolute times 5,18,28,40,52,64,128,160,184,195,220,232,250,270,285,299 with
`PYTHONIOENCODING=utf-8 python tools/stills.py productions/stef_37/film_a.html productions/stef_37/_stills --times 5,18,28,40,52,64,128,160,184,195,220,232,250,270,285,299 --fmt jpg --size 960x540 --timeout 900`
for the supervisor. No full render. NEVER Read a PNG (use `python tools/safe_view.py <dir> --out <dir2> --sheet 4` and read
only CLEAN jpgs if you must look). Never put Hebrew in code or chat; captions only as vault IDs.
