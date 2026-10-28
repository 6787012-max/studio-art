# stef_41 - "Lashon havai" (the Torah and the Sages spoke in deliberate exaggeration) - 3D graphics layer for a concept video

## What this film is
A 244.34 s silent 3D picture (1920x1080, 30 fps) that becomes the GRAPHICS LAYER of a lesson video. Later, locally, five
animation clips of another studio are laid OVER the clip shots (s03, s05, s10, s13, s14; rectangle x160-1760, y20-920, times in
`shots.ids.md`) and music is mixed in. Nothing of those clips is in this folder or in this code.
The video plays in a school lobby WITHOUT SOUND: every shot must explain its idea by what the objects DO; the caption (vault
ID) is the words.

Topic (English only, for you): Talmud Chullin 90b. In the Temple the ashes of the altar were gathered into a heap in the middle
of the altar called "tapuach" (the apple); the Mishna (Tamid 2:2) says "at times there were about 300 kor on it" - a mountain.
Rabbi Ami: "The Torah spoke in exaggerated language (lashon havai), the Prophets did, the Sages did." Torah: the spies said
the Canaanite cities are "great and fortified up to the heavens" (Deut 1:28) - very tall walls, not really in the sky. Prophets:
at King Solomon's coronation "the earth split with their sound" (1 Kings 1:40) - a huge noise. Sages: the ash heap (300 kor),
the golden vine on the Temple entrance (people donated golden leaves / grapes / clusters and hung them; once 300 priests
were counted to clear it), and the Temple curtain (300 priests immerse it). Message: exaggeration on purpose, to show how
great something is. Everyone understands it is not exact - so it is not a lie.

Read: `~/.claude/skills/video-production/references/builder_kit.md` (engine rules), this file, `timeline.json` (locked shot
durations + capAt) and `shots.ids.md` (shot table). Closest finished example: `productions/stef_40/` (`BRIEF.md`,
`film_a.html`, `hs.js`, `hs_base.js`, `render.json`) - it has the page structure, red-bar / green-check billboards, the
clock-ring question pattern, gold glowing lines, ASCII digit counter sign, the calm clip-hold backdrop. COPY stef_40's page
structure and reuse its builders (copy `hs_base.js` as `lh_base.js` if useful), then build the new objects. Write
`productions/stef_41/film_a.html` and a shared module `productions/stef_41/lh.js`; copy `stef_40/render.json` to
`stef_41/render.json` and fix its includes (lh.js / lh_base.js instead of hs.js / hs_base.js, plus every asset you use, plus
GLTFLoader if you load GLB models - a missing loader in render.json breaks the remote render).

## Hard technical contract
- `film({title:'TITLE', kicker:'KICKER', vault:'captions_vault.json', shots:[...]})` - NO recap, so `__dur` must equal
  exactly 244.34 (sum of timeline.json shot durations; use the timeline values, not this text). Shots s01..s17 in order,
  each `dur` = timeline.json value, `caps` = caption IDs of that shot in order, `capAt` = timeline.json capAt of that shot.
  s01 has no caps (title overlays 0-4.2 s).
- Captions sit in the bottom band (about y 0.78H-0.95H). Keep every key action in the upper 75% of the frame.
- Deterministic (function of t only), toon + ink house style, `Wd.hero = <main object>` in every shot.
- NO people, no hands, no bodies, no priests. Objects act by themselves (float, grow, glide, pop). Text in 3D: none, except
  ASCII digits (300) and the multiplication sign made of two crossed bars. Symbols instead of words.

## Visual codes (keep constant in all shots)
- ALTAR = a big square cream-stone block with a long ramp on one side, small flame tufts (orange toon cones) on its top corners.
- ASH HEAP ("tapuach") = a soft grey toon dome/cone of ash (lumpy: several merged grey spheres) in the CENTRE of the altar top.
- EXAGGERATION LENS = a large gold-rimmed magnifying glass (ring + handle, glass = faint blue additive disc). This is the central
  code of the film. When the lens passes over an object, a GIANT translucent "said" version of that object balloons up
  (scale x4-x8, soft gold additive shell, 35% opacity), while the REAL small object stays solid and visible INSIDE it.
  Real = solid; said = translucent giant around it. Both always visible together = "everyone can see it is enlarged".
- 300 BADGE = a round gold medallion with the ASCII digits 300 that pops with a pulse.
- CITY = 4-6 sand-coloured block towers with a crenellated wall ring; CLOUDS = soft white puffy spheres high up.
- CROWN = small gold crown floating above (the coronation); SOUND = concentric gold rings expanding outward; CRACK = dark zigzag
  crack line drawing itself across a sand ground slab, the two halves tilting apart slightly.
- GOLDEN VINE = a gold trellis of leaves and round grape clusters arched over a tall cream doorway (the Temple entrance);
  new single gold leaves / grapes / clusters float in from the sides and attach (donations, no hands).
- CURTAIN = a tall heavy curtain of deep red and blue stripes hanging from a gold rod; a square pool of light-blue water below.
- RED BAR billboard = "no / not"; GREEN CHECK billboard = "yes / correct" (from stef_40). MASK = a dark grey hiding box/cover.

## Art direction (owner order 26/10/2026)
Clean bright flat-explainer look rendered in 3D: soft toon materials, 4-5 colours per shot, lots of clean space, simple
backdrop, smooth motion, gentle camera moves, real depth (foreground edge / mid stage / soft far backdrop, parallax).
Palette: backdrop #E9E2D3 (warm parchment), stone cream #F3EBD3, sand #D8C9A8, ash grey #8C8A86, gold #E8B830, deep red
#A8322E, blue #2F5D9E, flame orange #F08A2E, red #C2453A, green #4FA35A, cloud white #FAFAF7. Warm near-white key light.
Every shot moves; frame 0 never empty; hero visible within 3 s.

## The central visual idea
THE EXAGGERATION LENS: the real thing stays small and solid; what was SAID balloons up around it as a giant translucent gold
shell. You see both at once - so it is obviously an exaggeration, not a deception.

## STORYBOARD (time = local seconds inside the shot; caption switch times = capAt in timeline.json)
| shot | dur | idea (caption IDs) | what the OBJECTS do + camera | character | viewer learns |
|---|---|---|---|---|---|
| s01 | 7.65 | title | Wide: altar on a pale courtyard, the ash heap in its centre; from 3 s the heap swells upward rhythmically; the gold lens drifts in from the right. Camera: slow crane down. | none | subject: a big thing, maybe "too big" |
| s02 | 11.53 | the "tapuach" (CAP_s02_1, _2) | Small grey ash puffs rise from the flame tufts on the corners and glide to the centre, merging into the round heap which grows (round like an apple - give it a faint apple-like dimple on top). Camera: slow push-in. | none | ashes gathered into a heap in the middle |
| s03 | 19.35 | CLIP HOLD (CAP_s03_1, _2) | Calm warm backdrop (soft parchment, drifting light motes, slow parallax at far edges). Nothing important in centre. Camera almost still. | none | (clip: ash shovelled and taken out) |
| s04 | 8.82 | Mishna: about 300 kor (CAP_s04_1) | The heap grows fast, a row of grey sacks (each = one kor) slides out beside the altar multiplying; the 300 badge pops above. Camera: pull back. | none | the Mishna says: 300 kor |
| s05 | 10.45 | CLIP HOLD (CAP_s05_1) | Same calm backdrop (reuse). | none | (clip: heap covering the altar) |
| s06 | 18.86 | QUESTION 1 (CAP_s06_1; think 4.9-10.9; CAP_s06_2 answer) | Giant heap towering over the tiny altar, 300 badge; clock ring fills during think; answer: the gold lens sweeps over: the giant heap turns translucent gold shell and the REAL normal heap is revealed solid inside it on the altar. Camera: slow drift. | none | not exact - exaggerated on purpose |
| s07 | 12.47 | Rabbi Ami: Torah, Prophets, Sages (CAP_s07_1) | Three plinths in a row with digits 1, 2, 3 on small plates: a large scroll (Torah), a smaller scroll (Prophets), a stack of books (Sages). The gold lens visits each in turn and its translucent gold "said" shell balloons around it. Camera: lateral truck. | none | all three use exaggeration |
| s08 | 13.69 | what is lashon havai (CAP_s08_1, _2) | A small sand tower block stands on a table. Lens passes: a giant translucent version balloons up around it, the real small one solid inside. Caption 2: both glow, green check pops. Camera: slow orbit 20 deg. | none | exaggerate to show greatness; everyone understands |
| s09 | 12.07 | Torah: cities in the sky (CAP_s09_1, _2) | Walled city of block towers on a hill; clouds above. Lens passes: translucent gold towers shoot up through the clouds; the real walls stay solid and merely tall. Camera: tilt up following the towers. | none | the spies exaggerated how tall |
| s10 | 8.55 | CLIP HOLD (CAP_s10_1) | Same calm backdrop (reuse). | none | (clip: spies looking at cities in the sky) |
| s11 | 13.69 | Prophets: earth split (CAP_s11_1, _2) | Gold crown floats above a sand ground slab; concentric gold sound rings pulse outward, bigger and bigger; a zigzag crack draws across the slab and the halves tilt apart (lens over it shows the crack as translucent gold - the "said" part). Camera: low angle push. | none | a very loud noise described as earth splitting |
| s12 | 10.45 | Sages: three things (CAP_s12_1, _2) | Three display plinths glide in: mini ash heap, mini golden vine over a doorway, mini striped curtain; each pops with a 300 badge in turn. Camera: slow lateral glide. | none | three Temple items with huge numbers |
| s13 | 40.35 | CLIP HOLD (CAP_s13_1.._4) | Same calm backdrop (reuse). | none | (clip: golden vine, donations, cleared) |
| s14 | 10.45 | CLIP HOLD (CAP_s14_1, _2) | Same calm backdrop (reuse). | none | (clip: the curtain) |
| s15 | 20.25 | QUESTION 2 lie vs havai (CAP_s15_1; think 4.5-10.5; CAP_s15_2 answer) | Two stations side by side. Left: a small object hidden under a dark MASK box, a fake giant shown in front - red bar. Right: the lens version (real solid inside the translucent giant, both visible) - green check. During think only the two stations sit with the clock ring; the billboards pop at the answer. Camera: high 3/4 drift. | none | everyone sees it is enlarged - no deception |
| s16 | 18.25 | SUMMARY (CAP_s16_1 / _2) | One continuous glide past four mini-stations, each with the lens shell: city towers in clouds -> crown + crack -> ash heap with 300 -> golden vine with 300. Ends with the lens alone glowing. | none | recap |
| s17 | 7.45 | credits (CAP_s17_1) | Calm wide: the Temple doorway with the golden vine in warm evening light, light motes, lens resting aside. | none | end |

## Done condition
`python tools/verify_scene.py productions/stef_41/film_a.html --out productions/stef_41/_verify --timeout 900` = PASS (zero
P0/P1), report copied to `productions/stef_41/VERIFY_REPORT.json`. Batch fixes, one full verify. Also render stills (JPG) at
absolute times 4,14,44,70,84,96,108,130,142,210,228,240 with
`PYTHONIOENCODING=utf-8 python tools/stills.py productions/stef_41/film_a.html productions/stef_41/_stills --times 4,14,44,70,84,96,108,130,142,210,228,240 --fmt jpg --size 960x540 --timeout 900`
for the supervisor. No full render. NEVER Read a PNG (use `python tools/safe_view.py <dir> --out <dir2> --sheet 4` and read
only CLEAN jpgs if you must look). Never put Hebrew in code or chat; captions only as vault IDs.
