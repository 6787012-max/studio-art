# stef_40 - "Hashev teshivem" (return a stray animal - even a hundred times) - 3D graphics layer for a concept video

## What this film is
A 216.01 s silent 3D picture (1920x1080, 30 fps) that becomes the GRAPHICS LAYER of a lesson video. Later, locally, four
animation clips of another studio are laid OVER the clip shots (s05, s06, s08, s10; rectangle x160-1760, y20-920, times in
`shots.ids.md`) and music is mixed in. Nothing of those clips is in this folder or in this code.
The video plays in a school lobby WITHOUT SOUND: every shot must explain its idea by what the objects DO; the caption (vault
ID) is the words.

Topic (English only, for you): Torah (Deut 22:1): if you see your fellow's ox or sheep straying, do not ignore them - "return,
you shall return them" (the verb is DOUBLED: hashev teshivem). Mishna (Bava Metzia 30b): he returned it and it ran away, returned
it and it ran away - even four or five times he must return it, because of the doubled verb. Rava (31a): "return" - even a
hundred times. Message: returning is not a one-time act; every time it escapes and is found, you return it again.

Read: `~/.claude/skills/video-production/references/builder_kit.md` (engine rules), this file, `timeline.json` (locked shot
durations + capAt) and `shots.ids.md` (shot table). Closest finished example: `productions/stef_39/` (`BRIEF.md`,
`film_a.html`, `ye.js`, `ye_base.js`, `render.json`) - it has the page structure, the cottage, red-bar / green-check
billboards, the clock-ring question pattern, gold glowing lines, the calm clip-hold backdrop. COPY stef_39's page structure
and reuse its builders (copy `ye_base.js` as `hs_base.js` if useful), then build the new objects. Write
`productions/stef_40/film_a.html` and a shared module `productions/stef_40/hs.js`; copy `stef_39/render.json` to
`stef_40/render.json` and fix its includes (hs.js / hs_base.js instead of ye.js / ye_base.js, plus every asset you use, plus
GLTFLoader if you load GLB models - see stef_34 lesson: a missing loader in render.json breaks the remote render).

## Hard technical contract
- `film({title:'TITLE', kicker:'KICKER', vault:'captions_vault.json', shots:[...]})` - NO recap, so `__dur` must equal
  exactly 216.01 (sum of timeline.json shot durations). Shots s01..s14 in order, each `dur` = timeline.json value, `caps` =
  caption IDs of that shot in order, `capAt` = timeline.json capAt of that shot. s01 has no caps (title overlays 0-4.2 s).
- Captions sit in the bottom band (about y 0.78H-0.95H). Keep every key action in the upper 75% of the frame.
- Deterministic (function of t only), toon + ink house style, `Wd.hero = <main object>` in every shot.
- NO people, no hands, no bodies. Animals are fine. Actions are done by objects/animals themselves (they walk, hop, glide along
  arrows). Text in 3D: none, except ASCII digits (the counter). Symbols instead of words.

## Visual codes (keep constant in all shots)
- OWNER'S HOME = the small cream cottage with terracotta roof and one warm lit window (from stef_39), with a round wooden PEN
  (low fence ring, a gate that swings) beside it. Inside the pen = "returned / at home".
- SHEEP = a white toon sheep (hero of the film). Use a library model if one exists
  (`python tools/assetlib.py search sheep --cat animal`; must be toon-friendly and load in the remote render), else build from
  primitives: cluster of white balls for wool, dark grey head and four short legs. COW = brown toon cow, same rule.
- ESCAPE = the sheep hops over the fence in a clear arc (small dust puff on landing) and trots away into the field.
- RETURN ARROW = a glowing gold dotted path (#E8B830, additive shimmer) that draws itself from the animal back to the pen gate;
  the animal trots along it into the pen, the gate swings shut, a green check billboard pops above the pen.
- COUNTER = a wooden sign on a post next to the pen with a big ASCII number (digits only) that increments by one with a
  gold pulse each time the animal is returned. This is the central code of the film.
- DOUBLE ARROW = two identical gold return arrows, one above the other (the doubled verb "return, return").
- IGNORE = a grey arrow that curves AWAY from the stray (passing it by), then a red bar billboard over it (forbidden).
- SCROLL = parchment roller (no text) for the verse.
- RED BAR billboard = "no / not"; GREEN CHECK billboard = "yes / must" (from stef_39).

## Art direction (owner order 26/10/2026)
Clean bright flat-explainer look rendered in 3D: soft toon materials, 4-5 colours per shot, lots of clean space, simple
backdrop, smooth motion, gentle camera moves, real depth (foreground edge / mid stage / soft far backdrop, parallax).
Palette: backdrop #E9E2D3 (warm parchment), grass #9CC27A, sand #D8C9A8, wood #6B4A32, cream #F3EBD3, terracotta #C9673E,
red #C2453A, green #4FA35A, gold #E8B830, sheep white #F7F4EC. Warm near-white key light. Every shot moves; frame 0 never
empty; hero visible within 3 s.

## The central visual idea
THE RETURN COUNTER. The sheep escapes, the gold arrow brings it home, the counter on the post goes up by one. Again and again:
1, 2 ... 5 ... 100. Returning is not finished after one time.

## STORYBOARD (time = local seconds inside the shot; caption switch times = capAt in timeline.json)
| shot | dur | idea (caption IDs) | what the OBJECTS do + camera | character | viewer learns |
|---|---|---|---|---|---|
| s01 | 7.65 | title | Wide: cottage + pen on the left, sheep inside the pen, counter post shows 0. At ~4.5 s the sheep hops over the fence and trots into the field. Camera: slow crane down. | none (sheep) | subject: an animal that runs away |
| s02 | 13.69 | verse (CAP_s02_1) | Scroll unrolls in the back. In front a sheep and an ox wander lost in a far field; a gold return arrow draws from them to the pen; they trot back along it into the pen, gate shuts, green check. Camera: slow push-in. | none | Torah: return a straying ox or sheep |
| s03 | 14.77 | the mitzva: do not ignore, return (CAP_s03_1, _2) | Stray sheep at the side of a path. First caption: a grey arrow curves past the sheep (ignoring it) and a red bar pops over it. Second caption: the grey arrow fades, a gold return arrow draws, the sheep trots home, green check. Camera: lateral truck. | none | do not pass by - return it |
| s04 | 14.77 | doubled verb: return again (CAP_s04_1, _2) | Two identical gold arrows hang above the field, one above the other (the doubled word). First caption: arrow 1 glows, sheep returned along it, counter 0->1. Then the sheep hops out again. Second caption: arrow 2 glows, sheep returned again, counter 1->2, green check. Camera: slow orbit 20 deg. | none | the doubled word means: return it again |
| s05 | 18.55 | CLIP HOLD (CAP_s05_1, _2) | Calm warm backdrop (soft parchment, drifting light motes, slow parallax at far edges). Nothing important in centre. Camera almost still. | none | (clip: animal opens the gate latch) |
| s06 | 18.05 | CLIP HOLD (CAP_s06_1, _2) | Same calm backdrop (reuse). | none | (clip: escapes again over the wall) |
| s07 | 12.07 | Mishna: even 4-5 times (CAP_s07_1, _2) | Fast rhythmic loop: sheep hops out, gold arrow, sheep back in, counter +1 - repeated so the counter goes 1,2,3 during caption 1 and 4,5 during caption 2, each return with a gold pulse; at 5 a green check. Camera: steady medium shot, slight push. | none | even four or five times you must return it |
| s08 | 12.55 | CLIP HOLD (CAP_s08_1, _2) | Same calm backdrop (reuse). | none | (clip: sheep jumps the fence) |
| s09 | 14.23 | Rava: even 100 times (CAP_s09_1, _2) | Camera pulls back and up from the pen: many faint gold return loops stack up around the pen like rings; counter digits roll fast from 5 up to 100 during caption 1; at caption 2 the number 100 lands with a big gold pulse and a green check, sheep calm inside the pen. | none | even a hundred times |
| s10 | 24.15 | CLIP HOLD (CAP_s10_1.._3) | Same calm backdrop (reuse). | none | (clip: cow on a highway) |
| s11 | 20.48 | QUESTION 1 (CAP_s11_1; think 6.5-12.5; CAP_s11_2 answer) | Cow standing in the field outside the pen (escaped again), counter shows 1; clock ring fills 6.5-12.5 above; answer: gold arrow draws, cow walks back into the pen, counter 1->2, green check. Camera: slow drift. | none | escaped again - return it again |
| s12 | 19.36 | QUESTION 2 (CAP_s12_1; think 4.5-10.5; CAP_s12_2 answer) | Scroll in the back, the two gold arrows (double arrow) hovering above it; clock ring 4.5-10.5; answer: arrow 1 then arrow 2 each carry the sheep home in turn, counter +1 each time, green check. Camera: high 3/4 drift. | none | why the word is doubled |
| s13 | 18.25 | SUMMARY (CAP_s13_1 / _2) | One continuous glide past four mini-stations: stray sheep + gold arrow home (counter 1) -> escapes and returns again (2) -> counter 5 -> counter 100 with green check. | none | recap |
| s14 | 7.45 | credits (CAP_s14_1) | Calm wide: evening light, the pen closed with sheep and cow inside, window warm, counter shows 100, light motes. | none | end |

## Done condition
`python tools/verify_scene.py productions/stef_40/film_a.html --out productions/stef_40/_verify --timeout 900` = PASS (zero
P0/P1), report copied to `productions/stef_40/VERIFY_REPORT.json`. Batch fixes, one full verify. Also render stills (JPG) at
absolute times 4,14,26,40,58,95,103,125,170,195,205,212 with
`PYTHONIOENCODING=utf-8 python tools/stills.py productions/stef_40/film_a.html productions/stef_40/_stills --times 4,14,26,40,58,95,103,125,170,195,205,212 --fmt jpg --size 960x540 --timeout 900`
for the supervisor. No full render. NEVER Read a PNG (use `python tools/safe_view.py <dir> --out <dir2> --sheet 4` and read
only CLEAN jpgs if you must look). Never put Hebrew in code or chat; captions only as vault IDs.
