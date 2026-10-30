# siach_20261029 - BRIEF (supervisor, 30/10/2026)

A 3D cel-shaded cartoon film (16:9, 1920x1080, 30 fps) that ILLUSTRATES a 4-minute recorded morning talk in the
study hall of a yeshiva prep school (the speaker's real voice is the narrator; it is mixed in LOCALLY later - the page
has NO audio and NO captions; captions and the title are burned in later by the supervisor).
Characters act and react; NOBODY lip-syncs the speaker. Theme: WHEN TO LOOK BACK AND WHEN TO LOOK FORWARD.

## Method (approved look - copy, never start from zero)
- COPY the newest finished production `C:/projects/_studio-animatzia/productions/katzar_k04_3d/` (film_a.html, film.js,
  props.js, people.js) - same engine, same page contract, same toon look, same people adapter. Make
  `productions/siach_20261029/film_a.html` + `film.js` + `props.js` + `people.js` (people.js may be copied unchanged; it
  imports `../haredi_cast/cast_people.js`).
- Read `~/.claude/skills/video-production/references/cartoon_style.md` and `references/builder_kit.md` (worker rules).
- Cast of 3D animals/objects: `C:/projects/_studio-animatzia/lib/toon3d/cast.js` + `toon3d.js` (e.g. CAST.sefer, CAST.stone).
- People ONLY through people.js: makeMan(), makeBochur(), makeBoy(), makeRabbiA(), makeRabbiB().
- Page contract exactly as katzar_k04_3d: `window.__dur`, `window.__seek(t)` (pure function of t, seeded random only),
  `window.__ready`, `?t=`, `?capture`, `?hq=1`.

## Rules
Men and boys only (NO women or girls anywhere - see s13). No crosses/churches/mosques. No readable text, letters or
digits anywhere in the picture. Every male has a visible kippa or hat. Bright warm cartoon palette; the Sedom beat is
dusk-orange and smoky far away, never scary. Leave the bottom 20% of the frame calm (captions go there later): no key
action below y=80%. Faces readable (hero >= 1/4 frame height in character beats). Real walk cycles, feet planted,
contact shadows. Every shot has a purposeful camera move. Nothing important cut by the frame edge. No crane that starts
inside a mesh. Kippa visible in every frame where a person's head is visible.

## Timeline (film time t, seconds; __dur = 247.3)
Voice starts at t=3.5 and ends at t=243.3. 0-3.5 = title moment (music only): keep the top-centre area of the first shot
calm for a title burned in later. 243.3-247.3 = final wide hold.

| shot | t (film) | what the speaker says | what we SEE |
|---|---|---|---|
| s01 | 0 - 18 | climbing the stairs of a tall building is hard; you can count floors passed or floors left - he decided on another way | slow crane down a tall bright stone apartment building with an outside spiral/zigzag staircase (8-10 floors, each landing marked by a coloured round lamp - NO numbers); the Bochur arrives at the bottom with a bag, looks up at the top, puffs his cheeks |
| s02 | 18 - 38 | do not look at the floors, not how many I passed and not how many are left - only at the step I am on now; climb, climb | close tracking on the Bochur climbing step by step, eyes on his own feet, calm steady rhythm (real step cycle up stairs, feet planted on each tread); camera rises with him; a soft glow under the step he is on |
| s03 | 38 - 56.6 | which is harder: "oy, still eight floors left" or "I already passed two, thank G-d, great, I managed" | the Bochur pauses on a landing. 38-47: he looks UP at the many landings above - they stretch taller (pure function of t), he droops, sighs. 47-56.6: he looks DOWN at the two landings below, their lamps light up gold one after the other, he straightens up and smiles. Slow orbit around him |
| s04 | 56.6 - 74 | small children on a trip ask "when do we arrive?" | a bright white minibus (no text, blank plate) drives on a winding road through green hills, camera tracks beside it; inside (cutaway or open side view) 4-5 small boys (makeBoy) bounce in their seats |
| s05 | 74 - 90 | after ten minutes of driving the little one already asks; he cannot feel how far we have come | inside the bus: one little boy tugs the sleeve of the Man (driver/teacher, makeMan, seated near the front) with a big questioning face, hands out; through the rear window the houses of the town are still very close behind. Slow push-in |
| s06 | 90 - 104.4 | understanding that we have passed a distance is part of growing from small to big | the road behind the bus becomes a glowing gold line that grows longer (pure function of t); camera rises high and wide; at the end the same window now shows the Bochur (older) looking back at the long glowing road with a content smile |
| s07 | 104.4 - 122 | coming to the mechina after the cheder: difficulties in learning, in reading, in getting up in the morning, being down all day | the Bochur at a shtender with an open gemara (grey line strokes, no letters) in a warm study hall, head in his hand, struggling; then (114-122) a grey rainy morning: he trudges out of a stone house door with his bag, shoulders down |
| s08 | 122 - 135 | a month passes, two months, half a year, a year | the Bochur walks along a long path that climbs a hill; along the path behind him are obstacles he has passed (big stones, a puddle, a fallen log); the sky brightens from grey to sunny as he walks (pure function of t); tracking wide |
| s09 | 135 - 145 | he looks back and says "wow, I got through this" - and so he can get through more | at the hilltop he turns and looks back down the path: each obstacle he passed lights up with a gold glow; he straightens up, fist of joy (small), a big smile; camera swings round to behind him to show the whole path |
| s10 | 145 - 160 | sometimes it is NOT good to look back: about someone who returned to the right way it is said - do not remind him of his past | the Man walks out of a grey, misty, shadowy area into sunlight carrying a heavy dark sack on his back (plain sack, no symbols); RabbiA waits warmly at the edge of the light. Tracking side view |
| s11 | 160 - 176.6 | forget it, open a new page; how do I know when to look back and when not? | RabbiA lifts the sack off the Man's back and sets it down behind them, where it fades into the mist; RabbiA opens a big book to a clean glowing white page (no letters) and offers it; the Man smiles, they walk forward together into the light. Slow pull-back |
| s12 | 176.6 - 194 | the angel told Lot: do not look back - you were in Sedom, a place of sinners, Hashem saved you; look forward | dusk desert road; far behind on the horizon a city glows orange with soft smoke (no detail, far away, not scary). Lot = makeRabbiB in a sand-coloured long robe with head cloth (or the model's coat recoloured sand #CDB68A), walking AWAY from the city toward camera, led by a soft floating orb of warm white light (the angel: just a glowing orb, NO wings, NO figure). Lot looks only forward. Low tracking camera in front of him |
| s13 | 194 - 212 | one who refused to look forward looked back - and became a pillar of salt | on the same road, behind Lot: a tall glittering white pillar of salt stands alone on the path (just a rough white crystal column, NO human shape, NO face), sparkles (pure function of t). Slow orbit around the pillar, Lot and the orb continue far ahead toward the light |
| s14 | 212 - 227.6 | it stayed salty - we want to be SWEET, not salty: look forward | the warm study hall: on a table a small white salt heap with crystals and a round clay jar of golden honey that glows warmly; the Bochur looks from the salt to the honey, smiles and takes the honey jar; a drop of honey shines. Slow push-in |
| s15 | 227.6 - 247.3 | there are cases to look back and cases not to; knowing when is part of our work in life | the Bochur stands where a path splits: behind him the gold-glowing path of passed obstacles (from s09), in front a bright golden staircase rising into soft light. He glances back (smiles), then turns forward and starts to climb (real step cycle). Camera pulls back and cranes up to a very wide calm hold (243.3-247.3 = hold, gentle drift only) |

Seams: s01-s03 one building; s03->s04 dissolve via bright sky; s04-s06 one road; s06->s07 dissolve; s07 two places (a
cut at 114 is fine); s08-s09 one hill path; s09->s10 dissolve; s10-s11 one place; s11->s12 dissolve via the light;
s12-s13 one road; s13->s14 dissolve via the white sparkle; s14->s15 dissolve.

## Verify and report
Run `python C:/projects/_studio-animatzia/tools/verify_scene.py <absolute path of film_a.html> --timeout 900`; it must PASS
(zero P0/P1). Copy the PASS VERIFY_REPORT.json to the production root if it was written elsewhere. Then make stills
(JPG only, never PNG) of the middle of every shot and LOOK at them: kippa visible, white shirts white, no figure cut,
no blank first frames, nothing in the bottom 20%. Fix and re-verify (batch fixes, one full verify; use --shot for small
checks). Do NOT render video. Report in English only (no Hebrew), with the path of the stills sheet (JPG) and the final
VERIFY status. Do not spawn sub-agents unless essential, and then one cheap, well-defined one.
