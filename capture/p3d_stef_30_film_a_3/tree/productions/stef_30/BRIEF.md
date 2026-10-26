# stef_30 - "The Showbread" (Lechem HaPanim) - 3D graphics layer for a concept video

## What this film is
A 215.34 s silent 3D picture (1920x1080, 30 fps) that becomes the GRAPHICS LAYER of a lesson video. Later, locally, two
animation clips of another studio are laid OVER shots s05 and s07 (rectangle x160-1760, y20-920) and audio is mixed in.
Nothing of those clips is in this folder or in this code. The video plays in a school lobby WITHOUT SOUND: every shot must
explain its idea by what the objects DO, the caption (vault ID) is the words.

Read: `C:/Users/<user>/.claude/skills/video-production/references/builder_kit.md` (engine rules; use `~`), this file,
`timeline.json` (locked shot durations + capAt) and `shots.ids.md` (shot table). Copy page structure from
`productions/azamra342/film_b.html` and `productions/_kit_build/film_demo.html`. Write `productions/stef_30/film_a.html`.

## Hard technical contract
- `film({title:'TITLE', kicker:'KICKER', vault:'captions_vault.json', shots:[...]})` - NO recap (recap omitted), so
  `__dur` must equal exactly 215.34. Shots s01..s14 in order, each `dur` = timeline.json value, `caps` = the caption IDs of
  that shot in order, `capAt` = timeline.json capAt of that shot. Shot s01 has no caps (the title card overlays 0-4.2 s).
- Captions sit in the bottom band (about y 0.78H-0.95H). Keep every key action in the upper 75% of the frame.
- Deterministic (function of t only), toon + ink house style, `Wd.hero = <main object>` in every shot.
- No people at all (no figure needed: hands/trays/objects move by themselves). No text in 3D except digits 1-7 (`label('1')` etc. are allowed; ASCII digits only).
- Assets: plain engine shapes (`box cyl ball`) + CC0 Kenney food models if useful: `D:/assets3d/kenney/food/loaf.glb`,
  `loaf-round.glb`, candle `D:/assets3d/kaykit/dungeon-remastered/addons/kaykit_dungeon_remastered/Assets/gltf/candle_lit.gltf.glb`
  (copy any GLB you use into `productions/stef_30/assets/`). A loaf can also be a rounded box - simple is fine.

## Art direction (owner order 26/10/2026)
Clean bright flat-explainer look rendered in 3D: soft toon materials, 4-5 colours, lots of clean space, simple backdrop,
smooth motion, gentle camera moves, real depth (foreground/mid/background layers, parallax). Palette: cream backdrop
#F3E6C8, gold #E2B43C (darker #B8871B for edges), loaf brown #C98A4B (crust #A4652F), deep red accent #8E2B2B (curtain hint),
air blue #7EC8E3. Warm neutral key light (keep it near-white), sky/backdrop carries the colour. Every shot moves; frame 0 of
every shot is never empty; the hero object is visible within 3 s.

## The central visual idea
ONE golden table (about 2.0 x 1.0 m top, short gold legs, raised rim) carrying TWO STACKS of SIX loaves each - the same
table in every shot, so the viewer learns one object deeply. Build it once in a shared module `lp.js` (table(), stack(n),
tube(), sevenDays(), clockRing()) and reuse.

## STORYBOARD (time = local seconds inside the shot)
| shot | dur | idea (caption IDs) | what the OBJECTS do (the action that explains it) + camera | character | viewer learns |
|---|---|---|---|---|---|
| s01 | 7.65 | title (TITLE/KICKER card 0-4.2) | Empty golden table on a cream stage; from 1.0 s loaves drop in one by one (soft bounce) forming two stacks of six by 6.5 s. Camera: slow crane down from high 3/4 to table height. | none | the subject: bread on a golden table |
| s02 | 9.43 | verse "place showbread before Me always" (CAP_s02_1) | Both stacks done. A soft light beam descends onto the table and a glowing ring of light keeps circling the stacks without stopping (= "always"). Camera: slow orbit 40 deg. | none | the bread is always before G-d |
| s03 | 12.61 | 12 loaves, two rows of six (CAP_s03_1, CAP_s03_2) | Loaves light up one by one with a floating digit 1-6 beside each loaf of the right stack, then 1-6 on the left stack; at the 2nd caption the two stacks glow in two tints and slide 10 cm apart to show "two arrangements". Camera: push-in to the stacks. | none | 12 = 2 x 6 |
| s04 | 9.91 | changed every Shabbat; old ones eaten by the priests (CAP_s04_1, _2) | A ring of 7 floating tiles (digits 1-7) circles behind the table; a light runs tile to tile; at tile 7 (two candles on it, lit) the old stacks slide off the table onto a tray that glides away to the side, while new golden-fresh stacks slide on. Camera: wide, slight dolly. | none | weekly swap; the old bread goes to be eaten |
| s05 | 10.55 | CLIP HOLD (CAP_s05_1, _2) | A clip covers x160-1760 y20-920 for 0-10.0 s. Show a calm, beautiful, softly moving cream/gold backdrop (slow drifting gold motes, gentle parallax of red curtain folds at the far left/right edges). Nothing important in the centre. Camera: almost still drift. | none | (the clip explains) |
| s06 | 11.53 | gold tubes between loaves so air passes and bread does not go mouldy (CAP_s06_1, _2) | Cut-away close-up of one stack, loaves slightly transparent: hollow gold tubes slide in between the loaves one by one; then small blue air streaks flow through the tubes and between the loaves. Beside it a "ghost" stack WITHOUT tubes slowly turns dull grey-green with spots (mould), while the stack with tubes stays golden. Camera: slow pull-back to reveal both. | none | the tubes keep the bread fresh |
| s07 | 39.35 | CLIP HOLD (CAP_s07_1, _2) | Same calm backdrop as s05 (reuse), clip covers 0-38.8 s. Slow continuous movement so 39 s never looks frozen. | none | (the clip explains) |
| s08 | 14.77 | arranging the tubes does not override Shabbat; a short time without tubes does not spoil the bread (CAP_s08_1, _2) | A sky dome behind the table goes from Friday afternoon (light) to sunset (warm) : just BEFORE sunset the tubes slide out and are laid lengthwise along the table beside the stacks; two candles light; night blue with stars - the loaves stay golden (a small green check-shine pulses on them); then stars fade to Saturday night and the tubes slide back in. Camera: wide, slow arc. | none | tubes out before Shabbat, back after; bread stays fine |
| s09 | 13.15 | swap: these pull, those place - table never empty (CAP_s09_1, _2) | Slow motion: old stacks slide out to the LEFT on trays at exactly the same moment new stacks slide in from the RIGHT, the new loaves touching the old ones' place as they leave; a glowing outline on the table top under the loaves stays lit the whole time (never off). Repeat the move once, slower. Camera: low side view then top view. | none | the table is never left empty |
| s10 | 14.23 | miracle: bread as warm as the day it was placed (CAP_s10_1, _2) | The 7-day tile ring lights tile by tile 1-7 (fast); all week the loaves breathe gentle steam wisps and a warm orange glow; on day 7 the stack is lifted and a bigger puff of steam rises - still hot. Camera: push-in to the steam. | none | the bread stayed hot all week (a miracle) |
| s11 | 21.73 | QUESTION (CAP_s11_1 question 0.3-6.5; think 6.5-11.5; CAP_s11_2 answer from 11.5) | Big 3D clock ring floats above the table; during 6.5-11.5 its gold ring fills like a countdown (5 s); then answer: tubes slide out of the stacks while the two Shabbat candles light. Camera: slow drift. | none | question + reveal |
| s12 | 21.73 | QUESTION (CAP_s12_1 0.3-6.5; think 6.5-11.5; CAP_s12_2 from 11.5) | Same clock ring countdown; answer: two things light up in turn - blue air streaks through the tubes, then warm steam glow over the loaves. | none | question + reveal |
| s13 | 21.25 | SUMMARY (CAP_s13_1 / _2 / _3, about 7 s each) | One continuous camera glide along the table: (1) two stacks of six + the 7-day ring, (2) tubes with air streaks, (3) candles + steam glow. | none | recap |
| s14 | 7.45 | credits (CAP_s14_1) | Calm wide of the finished table, light slowly dims, gold motes. | none | end |

## Done condition
`python tools/verify_scene.py productions/stef_30/film_a.html --out productions/stef_30/_verify --timeout 900` = PASS (zero
P0/P1), report copied to `productions/stef_30/VERIFY_REPORT.json`. Batch fixes, one full verify. No full render.
