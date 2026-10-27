# stef_39 - "Yeush" (an owner giving up hope on a lost object) - 3D graphics layer for a concept video

## What this film is
A 369.38 s silent 3D picture (1920x1080, 30 fps) that becomes the GRAPHICS LAYER of a lesson video. Later, locally, nine
animation clips of another studio are laid OVER the clip shots (s06, s07, s08, s09, s11, s13, s15, s18, s19; rectangle
x160-1760, y20-920, times in `shots.ids.md`) and music is mixed in. Nothing of those clips is in this folder or in this code.
The video plays in a school lobby WITHOUT SOUND: every shot must explain its idea by what the objects DO; the caption (vault
ID) is the words.

Topic (English only, for you): Torah: return a lost object to its owner (Deut 22:3). BUT if the owner has given up hope
("yeush") the object becomes ownerless and the finder may keep it. Cases (Talmud Bava Metzia 21-23):
- A FLOOD (river sweeps things away): lost from everyone -> owner gives up -> whoever saves it from the river keeps it.
- SCATTERED COINS: a person feels his pocket all the time, so he notices at once and gives up -> finder keeps.
- SCATTERED PRODUCE, a small amount spread over a large area ("a kav in four cubits"): too much bother to collect -> owner
  gives up -> finder keeps.
- GLEANINGS in a field: after the last poor gleaners have passed, the poor have given up -> anyone may take.
- An object WITH AN IDENTIFYING SIGN: the owner does NOT give up (he expects the finder to announce it and he will give the
  sign and get it back) -> must be returned.
- Small sheaves dropped on a busy public road: people trample them -> owner gives up -> finder keeps.
- "Yeush without knowing": the owner does not yet know he lost it. Abaye: not yeush. Rava: yeush. The law follows Abaye.

Read: `~/.claude/skills/video-production/references/builder_kit.md` (engine rules), this file, `timeline.json` (locked
shot durations + capAt) and `shots.ids.md` (shot table). Closest finished example: `productions/stef_38/` (`BRIEF.md`,
`film_a.html`, `wt.js`, `render.json`) - it has the page structure, red-bar / green-check billboards, the clock-ring question
pattern, the gold-ring and beam helpers and the calm clip-hold backdrop. COPY stef_38's page structure and reuse its
builders, then build the new objects. Write `productions/stef_39/film_a.html` and a shared module `productions/stef_39/ye.js`;
copy `stef_38/render.json` to `stef_39/render.json` (includes: ye.js instead of wt.js, plus any assets you use).

## Hard technical contract
- `film({title:'TITLE', kicker:'KICKER', vault:'captions_vault.json', shots:[...]})` - NO recap, so `__dur` must equal
  exactly 369.38 (sum of timeline.json shot durations). Shots s01..s24 in order, each `dur` = timeline.json value, `caps` =
  caption IDs of that shot in order, `capAt` = timeline.json capAt of that shot. s01 has no caps (title overlays 0-4.2 s).
- Captions sit in the bottom band (about y 0.78H-0.95H). Keep every key action in the upper 75% of the frame.
- Deterministic (function of t only), toon + ink house style, `Wd.hero = <main object>` in every shot.
- NO people, no hands, no bodies. Actions are done by objects themselves (things slide, float, glow, snap, roll). Text in 3D:
  none, except ASCII digits (4). Symbols instead of words.

## Visual codes (keep constant in all shots)
- OWNER'S HOUSE = a small cream cottage with a terracotta roof and ONE warm lit window (the owner; no person shown).
- LOST OBJECT = a small wooden crate (dark wood #6B4A32 edges, light planks #D8B98A).
- HOPE THREAD = a thin glowing gold line (#E8B830, additive, gentle shimmer) from the house window to the lost object. While
  the owner still hopes, the thread is bright. YEUSH = the thread flickers, thins and SNAPS in the middle (two ends curl
  away and fade) and the house window dims to a soft grey-blue. This is the central code of the film - use it in every
  case.
- OWNERLESS = after the snap, a soft white halo ring pulses under the object.
- FINDER = a woven basket (#C9A15A) on the other side; when the object is ownerless it slides/hops into the basket and a
  green check billboard appears. When the object must be returned, it glides back along the thread to the house instead.
- SIGN (siman) = a small teal diamond tag (#3FA7A0) tied on the crate with a short cord. A sign keeps the thread strong.
- ANNOUNCE = a brass horn on a post that emits gold rings of light (the finder announces).
- RIVER = a flat moving water plane (#4FA8E0 with lighter animated stripes) between banks of sand-coloured ground.
- COINS = flat gold discs (#E8B830 with darker rim). POUCH = a soft cloth money pouch (#7A5CA8) hanging on a hook by the
  house door.
- GRAIN = small rounded beads (#E2C46A). FOUR-CUBIT SQUARE = a large square outlined by four short wooden pegs and a thin
  rope; a digit "4" floats above one side.
- FIELD = a patch of golden stalks (#E2B94A) on brown soil. GLEANER BASKETS = a short row of small empty baskets that slide
  across the field one after another and leave.
- PATH = a paved grey-beige road; FOOTPRINTS = flat dark oval stamps that drop onto the path (no people) in a marching rhythm.
- SCROLL = a parchment roller (no text) for the verse.
- RED BAR billboard = "no / not"; GREEN CHECK billboard = "yes / allowed" (from stef_38).

## Art direction (owner order 26/10/2026)
Clean bright flat-explainer look rendered in 3D: soft toon materials, 4-5 colours per shot, lots of clean space, simple
backdrop, smooth motion, gentle camera moves, real depth (foreground edge / mid stage / soft far backdrop, parallax).
Palette: backdrop #E9E2D3 (warm parchment), sand #D8C9A8, wood #6B4A32, cream #F3EBD3, terracotta #C9673E, red #C2453A,
green #4FA35A, gold #E8B830, teal #3FA7A0, water #4FA8E0. Warm near-white key light. Every shot moves; frame 0 never
empty; hero visible within 3 s.

## The central visual idea
THE HOPE THREAD. A gold thread runs from the owner's lit window to the lost crate. When the thread snaps (yeush) the crate is
free and slides into the finder's basket; when the thread holds (a sign, or the owner does not yet know) the crate goes home.

## STORYBOARD (time = local seconds inside the shot)
| shot | dur | idea (caption IDs) | what the OBJECTS do + camera | character | viewer learns |
|---|---|---|---|---|---|
| s01 | 7.65 | title | Wide: owner's house on the left with lit window, a crate lying on the path in the middle, gold thread from window to crate shimmering, basket far right. Camera: slow crane down. | none | subject: a lost object and its owner |
| s02 | 12.47 | verse: return every lost object (CAP_s02_1) | Parchment scroll unrolls in the back; in front the crate glides back along the thread to the house door, window brightens, small green check. Camera: slow push-in. | none | the Torah says to return lost things |
| s03 | 13.69 | mitzva to return; but sometimes finder keeps (CAP_s03_1, _2) | First caption: crate returns home along the thread (green check over house). Second caption: a second crate appears on the path, its thread SNAPS, halo pulses, crate hops into the basket (green check over basket). Camera: lateral truck left to right. | none | usually return; sometimes the finder keeps |
| s04 | 18.55 | what is yeush (CAP_s04_1, _2) | Close on one crate with bright thread; at 1st caption the house window slowly dims and the thread flickers, thins and snaps (ends curl away); at 2nd caption halo ring pulses, then the crate slides into the basket. Camera: slow orbit 20 deg. | none | owner gives up -> ownerless -> finder keeps |
| s05 | 17.47 | flood: lost from everyone (CAP_s05_1, _2) | Crate on a river bank, thread to the house up the hill; water level rises and the river sweeps the crate downstream; thread stretches and snaps; at 2nd caption the drifting crate is caught by the basket floating at a bend (green check). Camera: crane up and drift downstream. | none | what the river sweeps away is lost to all |
| s06 | 15.55 | CLIP HOLD (CAP_s06_1, _2) | Calm warm backdrop (soft parchment, drifting light motes, slow parallax at far edges). Nothing important in centre. Camera almost still. | none | (clip: river overflows) |
| s07 | 16.55 | CLIP HOLD (CAP_s07_1, _2) | Same calm backdrop (reuse). | none | (clip: flooded city) |
| s08 | 25.55 | CLIP HOLD (CAP_s08_1.._3) | Same calm backdrop (reuse). | none | (clip: flood sweeps cars, houses) |
| s09 | 14.55 | CLIP HOLD (CAP_s09_1, _2) | Same calm backdrop (reuse). | none | (clip: logs swept by flood) |
| s10 | 15.31 | scattered coins: pocket felt all the time (CAP_s10_1, _2) | Pouch on its hook by the door; coins slip out one by one and scatter along the path; at 2nd caption the pouch gives a quick shake (it is checked), the window dims at once and the thread to the coins snaps quickly; coins glow with halo and roll into the basket. Camera: slow push-in to the pouch then pull back. | none | coins: the owner notices at once and gives up |
| s11 | 20.55 | CLIP HOLD (CAP_s11_1, _2) | Same calm backdrop (reuse). | none | (clip: cash on a highway) |
| s12 | 13.69 | a kav in four cubits (CAP_s12_1, _2) | A small sack tips; grain beads spread thinly across the large four-cubit square (pegs + rope, digit "4"); the thread from the house to the sack sags and snaps (too much bother). Camera: high 3/4 crane showing the square. | none | a little spread wide -> owner gives up |
| s13 | 13.85 | CLIP HOLD (CAP_s13_1, _2) | Same calm backdrop (reuse). | none | (clip: load falls from a truck) |
| s14 | 16.39 | gleanings after the last poor passed (CAP_s14_1, _2) | Field of stalks with a few loose stalks lying; a row of small baskets slides across the field one by one and exits; when the LAST basket leaves, the threads from the loose stalks to the departed baskets snap and the stalks get halos; a new basket enters and picks them up (green check). Camera: slow lateral truck. | none | after the last gleaners, anyone may take |
| s15 | 6.05 | CLIP HOLD (CAP_s15_1) | Same calm backdrop (reuse). | none | (clip: stalks left in the field) |
| s16 | 16.39 | with a sign there is no yeush (CAP_s16_1, _2) | Crate WITH the teal diamond tag lies on the path; the window flickers but the thread STAYS bright (the tag glows teal); at 2nd caption the brass horn emits gold rings (announcement), the tag sends a teal pulse up the thread to the window, and the crate glides home (green check at house). Camera: slow push from the horn to the house. | none | a sign keeps hope alive -> return it |
| s17 | 15.31 | small sheaves on a public road (CAP_s17_1, _2) | A small tied sheaf with a teal knot on a busy path; footprint stamps march over it in rhythm; the knot flattens and darkens; at 2nd caption the thread snaps, halo, sheaf slides into the basket. Camera: low angle along the path, then rise. | none | trampled on a public road -> owner gives up |
| s18 | 17.05 | CLIP HOLD (CAP_s18_1, _2) | Same calm backdrop (reuse). | none | (clip: a sheaf falls in the market) |
| s19 | 5.75 | CLIP HOLD (CAP_s19_1) | Same calm backdrop (reuse). | none | (clip: feet step on the sheaf) |
| s20 | 16.93 | yeush without knowing; law like Abaye (CAP_s20_1, _2) | Crate lying away from the house; window still bright and calm (owner unaware), thread drawn as a dotted gold line; a balance scale appears beside: left pan holds a red-bar token, right pan a green-check token; at 2nd caption the scale tips toward the RED BAR side, the dotted thread turns solid again and the crate glides back home (not yeush). Camera: slow orbit. | none | not knowing is not yeush (law like Abaye) |
| s21 | 22.28 | QUESTION 1 (CAP_s21_1; think 6.5-12.5; CAP_s21_2 answer) | Coins on the path, pouch on hook, clock ring fills 6.5-12.5 above; answer: pouch shakes, thread snaps at once, coins roll to the basket. Camera: slow drift. | none | coins: owner checks his pocket and knows |
| s22 | 21.02 | QUESTION 2 (CAP_s22_1; think 5.7-11.7; CAP_s22_2 answer) | Tagged crate on the path, clock ring 5.7-11.7; answer: tag glows, horn rings, thread holds and the crate goes home. Camera: high 3/4 drift. | none | a sign: no yeush |
| s23 | 18.25 | SUMMARY (CAP_s23_1 / _2) | One continuous glide past four mini-stations: crate returning home (check) -> snapped thread + basket -> river and coins with snapped threads -> tagged crate with strong thread and horn. | none | recap |
| s24 | 7.45 | credits (CAP_s24_1) | Calm wide: the house at evening light, window warm, the crate back by the door, light motes. | none | end |

## Done condition
`python tools/verify_scene.py productions/stef_39/film_a.html --out productions/stef_39/_verify --timeout 900` = PASS (zero
P0/P1), report copied to `productions/stef_39/VERIFY_REPORT.json`. Batch fixes, one full verify. Also render stills (JPG) at
absolute times 4,16,30,48,64,150,185,215,238,252,292,315,335,352,366 with
`PYTHONIOENCODING=utf-8 python tools/stills.py productions/stef_39/film_a.html productions/stef_39/_stills --times 4,16,30,48,64,150,185,215,238,252,292,315,335,352,366 --fmt jpg --size 960x540 --timeout 900`
for the supervisor. No full render. NEVER Read a PNG (use `python tools/safe_view.py <dir> --out <dir2> --sheet 4` and read
only CLEAN jpgs if you must look). Never put Hebrew in code or chat; captions only as vault IDs.
