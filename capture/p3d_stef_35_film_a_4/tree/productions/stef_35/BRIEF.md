# stef_35 - "Disqualified consecrated animals" (psulei hamukdashin) - 3D graphics layer for a concept video

## What this film is
A 215.75 s silent 3D picture (1920x1080, 30 fps) that becomes the GRAPHICS LAYER of a lesson video. Later, locally, two
animation clips of another studio are laid OVER shots s03 (0-14.2 s) and s11 (0-30.0 s) (rectangle x160-1760, y20-920) and
music is mixed in. Nothing of those clips is in this folder or in this code. The video plays in a school lobby WITHOUT SOUND:
every shot must explain its idea by what the objects DO; the caption (vault ID) is the words.

Topic (for you, English only): a sheep was consecrated as an offering. Then it got a BLEMISH (permanent defect), so it can
no longer be offered on the altar. It is REDEEMED with money (the money buys another animal for the offering). After that it
may be slaughtered and its meat eaten - BUT it is not a fully ordinary animal: its wool may NOT be shorn, it may not be
worked, its milk may not be drunk, and it is not redeemed to feed it to dogs. These come from one verse: "you may slaughter"
- not shearing; "meat" - not milk; "and you shall eat" - not for your dogs. ORDER matters: if the blemish came BEFORE the
consecration, then after redemption it is a fully ordinary animal (shearing, work, milk all allowed). An animal that was
redeemed and only AFTER that became pregnant - its lamb is permitted.

Read: `~/.claude/skills/video-production/references/builder_kit.md` (engine rules), this file, `timeline.json` (locked shot
durations + capAt) and `shots.ids.md` (shot table). Closest finished example: `productions/stef_34/` (`BRIEF.md`,
`film_a.html`, `ch.js`, `render.json`). COPY stef_34's page structure, its clip-hold backdrop shots, its clock ring and
question-shot pattern, its ground/sky/hills setup, its coin columns; then build the new objects. Write
`productions/stef_35/film_a.html` and a shared module `productions/stef_35/ps.js`; copy `stef_34/render.json` to
`stef_35/render.json` (adjust includes: ps.js instead of ch.js, plus any assets you actually use).

## Hard technical contract
- `film({title:'TITLE', kicker:'KICKER', vault:'captions_vault.json', shots:[...]})` - NO recap, so `__dur` must equal
  exactly 215.75 (sum of timeline.json shot durations). Shots s01..s15 in order, each `dur` = timeline.json value, `caps` =
  caption IDs of that shot in order, `capAt` = timeline.json capAt of that shot. s01 has no caps (title card overlays 0-4.2 s).
- Captions sit in the bottom band (about y 0.78H-0.95H). Keep every key action in the upper 75% of the frame.
- Deterministic (function of t only), toon + ink house style, `Wd.hero = <main object>` in every shot.
- NO people, no hands, no knife, no blood, no slaughter shown. Actions are done by objects themselves (things slide, float,
  pop, glow). Text in 3D: none, except ASCII digits if needed. Symbols instead of words.
- The SHEEP: build it from shapes in `ps.js` (`sheep(opts)`: a cluster of white wool balls as body, dark grey head and
  four short legs, small ears; gentle breathing/bob; optional walk cycle by leg swing). Same model for the small LAMB
  (scale 0.55). Optional: the CC0 donkey from stef_34 is NOT used here.
- Visual codes (keep constant in all shots):
  * CONSECRATED = soft GOLD glow ring under the hooves + small gold sparkles rising.
  * BLEMISH = a RED bandage band on one front leg + a small red pulsing dot above it.
  * ALTAR = a clean light-stone altar block with a ramp (simple boxes), a calm flame on top (toon flame cones, flicker).
  * REDEMPTION = gold coin column(s) (flat gold cylinders) sliding to a wooden chest; the gold ring passes from the sheep to
    the coins/chest.
  * FORBIDDEN = red X billboard over an object; ALLOWED = green check. Objects: SHEARS (two crossed blade shapes),
    WOOL tuft, MILK PAIL (grey bucket, white milk surface), small PLOUGH/yoke (wood), DOG BOWL (red bowl) + a small
    simple toon dog from shapes (optional: CC0 `kenney/cube-pets/animal-dog.glb`, find via `python tools/assetlib.py search dog`).
  * ORDER TRACK = a straight path of 3-4 round stepping stones; on each stone a floating SYMBOL token appears in turn:
    gold ring token (consecration), red dot token (blemish), coin token (redemption), small lamb (birth).

## Art direction (owner order 26/10/2026)
Clean bright flat-explainer look rendered in 3D: soft toon materials, 4-5 colours per shot, lots of clean space, simple
sky backdrop, smooth motion, gentle camera moves, real depth (foreground grass edge / mid meadow / far soft hills,
parallax). Palette: sky #CFE6F2, meadow #9CCB7A, stone #E8D9B5, wool #F6F2E8, gold #E8B830, chest wood #8A5A3B,
blemish red #C2453A, check green #4FA35A. Warm near-white key light. Every shot moves; frame 0 never empty; hero visible
within 3 s.

## The central visual idea
ONE meadow with ONE sheep. Its gold ring (holiness) and its red bandage (blemish) tell its story. When it is redeemed the
gold passes to the coins - yet a faint gold glint stays on the WOOL and on the MILK PAIL, which is why those stay forbidden.

## STORYBOARD (time = local seconds inside the shot)
| shot | dur | idea (caption IDs) | what the OBJECTS do + camera | character | viewer learns |
|---|---|---|---|---|---|
| s01 | 7.65 | title | Meadow; the sheep with gold ring stands near the altar (flame); at ~4 s a red pulse appears and the red bandage wraps its leg. Camera: slow crane down from high 3/4. | none | subject: holy animal + blemish |
| s02 | 12.61 | what is it: consecrated, then a blemish, cannot be offered (CAP_s02_1, _2) | Sheep with gold ring walks toward the altar ramp; red bandage appears on the leg; at 2nd caption a translucent barrier/red X rises at the foot of the ramp, the sheep stops and steps back. Camera: lateral truck along the sheep. | none | blemished = not offered |
| s03 | 14.75 | CLIP HOLD (CAP_s03_1.._3) | Clip covers x160-1760 y20-920 for 0-14.2 s. Calm soft backdrop (sky, distant hills, drifting light motes, slow parallax at far edges). Nothing important in the centre. Camera almost still. | none | (clip: unblemished animal on the altar) |
| s04 | 9.91 | if a blemish: redeem it with money; the money buys another animal (CAP_s04_1, _2) | Blemished sheep + gold ring on the left, wooden chest centre. Coin column rises and slides into chest; the gold ring lifts OFF the sheep and settles on the chest. At 2nd caption a second, healthy sheep (no bandage) appears beside the altar on the right, gets a gold ring and steps up the ramp. Camera: slow push-in then drift right. | none | money replaces it; another animal is offered |
| s05 | 7.88 | verse quote (CAP_s05_1) | Calm close shot: the redeemed sheep grazing, gold motes slowly orbiting it; a soft spotlight. Camera: slow orbit 15 deg. | none | the verse is about this animal |
| s06 | 11.53 | "you may slaughter" - not shearing (CAP_s06_1, _2) | Redeemed sheep; SHEARS float toward its wool; at 2nd caption the shears stop, a faint gold glint shines on the wool, red X pops over the shears and they retreat. Camera: medium, slow push-in. | none | no shearing |
| s07 | 12.07 | "meat" - not milk (CAP_s07_1, _2) | MILK PAIL slides under the sheep; white milk level starts to rise; at 2nd caption milk surface glints gold, red X over the pail, pail slides away empty. Camera: low angle, gentle drift. | none | no milk |
| s08 | 12.61 | "you shall eat" - not for your dogs (CAP_s08_1, _2) | A small toon dog with a red DOG BOWL on one side, the sheep's chest of coins on the other; a coin column starts to slide toward the dog bowl; at 2nd caption it stops, red X over the bowl, the coins slide back to the chest. Camera: wide, slow lateral. | none | not redeemed for dogs |
| s09 | 15.85 | what came first: blemish or consecration? if the blemish came first, after redemption it is fully ordinary (CAP_s09_1, _2) | ORDER TRACK of stones. Two sheep on two parallel tracks. Track A: gold token then red token (upper row). Track B: red token FIRST then gold token. At 2nd caption on track B the coin token appears, all gold fades from that sheep completely, and green checks pop over shears, pail, plough beside it; track A sheep keeps the faint gold glint, red X's there. Camera: high 3/4, slow drift from A to B. | none | order changes the law |
| s10 | 14.23 | lamb: pregnant after redemption - the lamb is permitted (CAP_s10_1, _2) | ORDER TRACK: gold token, red token, coin token light up in turn; then a small LAMB pops up on the 4th stone next to its mother; at 2nd caption a green check above the lamb, the lamb hops. Camera: slow truck along the track. | none | lamb conceived after redemption is permitted |
| s11 | 30.55 | CLIP HOLD (CAP_s11_1.._5) | Same calm backdrop as s03 (reuse). | none | (clip: flags show the order) |
| s12 | 18.49 | QUESTION 1 (CAP_s12_1; think 7.3-12.3; CAP_s12_2 answer) | Track A sheep (gold token, then red token, then coin token), shears hovering; clock ring floats above, ring fills 7.3-12.3. Answer: wool glints gold, red X over shears, shears retreat. Camera: slow drift. | none | redeemed + blemish after = no shearing |
| s13 | 21.92 | QUESTION 2 (CAP_s13_1; think 5.7-11.7; CAP_s13_2 answer) | Track B sheep (red token first, then gold); clock ring 5.7-11.7. Answer: the altar in the background with a translucent barrier that was ALWAYS there; the gold ring on this sheep was only a thin outline that moves entirely onto the coins; green check over the shears. Camera: low wide, gentle rise. | none | it was never fit for the altar; only its value was holy |
| s14 | 18.25 | SUMMARY (CAP_s14_1 / _2, about 9 s each) | One continuous glide: (1) blemished sheep -> coins into chest -> sheep grazing; (2) row of shears, pail, plough, dog bowl each with red X, then on the far side the "blemish-first" sheep with green checks. | none | recap |
| s15 | 7.45 | credits (CAP_s15_1) | Calm wide of the meadow at golden evening light, sheep and lamb grazing, altar flame far away, light motes. | none | end |

## Done condition
`python tools/verify_scene.py productions/stef_35/film_a.html --out productions/stef_35/_verify --timeout 900` = PASS (zero
P0/P1), report copied to `productions/stef_35/VERIFY_REPORT.json`. Batch fixes, one full verify. Also render stills (JPG) at
absolute times 5,16,42,61,72,84,99,114,165,202 with
`PYTHONIOENCODING=utf-8 python tools/stills.py productions/stef_35/film_a.html productions/stef_35/_stills --times 5,16,42,61,72,84,99,114,165,202 --fmt jpg --size 960x540 --timeout 900`
for the supervisor. No full render. NEVER Read a PNG (use `python tools/safe_view.py <dir> --out <dir2> --sheet 4` and read
only CLEAN jpgs if you must look). Never put Hebrew in code or chat; captions only as vault IDs.
