# siach_20261030 - BRIEF (supervisor, 31/10/2026)

A 3D cel-shaded cartoon film (16:9, 1920x1080, 30 fps) that ILLUSTRATES a 4-minute recorded morning talk in the
study hall of a yeshiva prep school (the speaker's real voice is the narrator; it is mixed in LOCALLY later - the page
has NO audio and NO captions; captions and the title are burned in later by the supervisor).
Characters act and react; NOBODY lip-syncs the speaker. Theme: THE SEASON OF SOWING - you plant, water, see nothing for
a long time, then it suddenly grows; the rain that makes it grow is help from Above, asked for in prayer.

## Method (approved look - copy, never start from zero)
- COPY the previous finished production `C:/projects/_studio-animatzia/productions/siach_20261029/` (film_a.html,
  film.js, film_src_[abcd].js, build_film.py, props.js, people.js) into `productions/siach_20261030/` and REWRITE the
  shots. Same engine, same page contract, same toon look, same people adapter, same build_film.py idea (fix paths).
  Reuse its helpers (walk cycle, Bochur, Man, RabbiA, study hall, sky, dissolves) wherever they fit.
- Read `~/.claude/skills/video-production/references/cartoon_style.md` and `references/builder_kit.md` (worker rules).
- Cast of 3D animals/objects: `C:/projects/_studio-animatzia/lib/toon3d/cast.js` + `toon3d.js`.
- People ONLY through people.js: makeMan(), makeBochur(), makeBoy(), makeRabbiA(), makeRabbiB().
- Page contract exactly as before: `window.__dur`, `window.__seek(t)` (pure function of t, seeded random only),
  `window.__ready`, `?t=`, `?capture`, `?hq=1`. IMPORTANT (bug found 30/10): `__seek` must honour the part offset `__T0`
  used by the remote renderer exactly as siach_20261029/film.js does after its fix - keep that code.

## Rules
Men and boys only (NO women or girls anywhere). No crosses/churches/mosques. No readable text, letters or digits
anywhere in the picture (rain gauge = plain tube with a blue water level, no marks). Every male has a visible kippa or
hat. Bright warm cartoon palette. Leave the bottom 20% of the frame calm (captions go there later): no key action below
y=80%. Faces readable (hero >= 1/4 frame height in character beats). Real walk cycles, feet planted, contact shadows.
Every shot has a purposeful camera move. Nothing important cut by the frame edge. No crane that starts inside a mesh.
Kippa visible in every frame where a person's head is visible. Growth/time effects are pure functions of t.

## Timeline (film time t, seconds; __dur = 246.5)
Voice starts at t=3.5 and ends at t=242.5. 0-3.5 = title moment (music only): keep the top-centre area of the first shot
calm for a title burned in later. 242.5-246.5 = final wide hold.

| shot | t (film) | what the speaker says | what we SEE |
|---|---|---|---|
| s01 | 0 - 18 | in this season the farmers sow: they plough the field and put the seeds in | wide sunrise over gentle green-brown hills and a small farming village (red roofs, no signs); crane down to a ploughed brown field in long furrows; the Man (farmer: makeMan, straw-coloured hat) walks along a furrow scattering seeds from a cloth bag at his hip (real walk, arm swing throws seeds, tiny seeds arc down) |
| s02 | 18 - 35 | some seeds need little water, some need a big investment of water | the farmer opens a simple irrigation pipe/sprinkler line along the furrows; sprinklers turn and throw soft sparkling arcs of water over the field (pure function of t); camera tracks low along the wet furrow |
| s03 | 35 - 52 | Chazal say: this season, every bochur, every person is in a season of sowing | dissolve to the warm study hall: a row of bochurim (makeBochur) at shtenders; the hero Bochur in front; soft gold seed-like motes of light float down and settle into each bochur's chest (pure function of t); slow push-in on the hero |
| s04 | 52 - 70 | sowing in a person means taking on something small - coming on time, reviewing, praying properly | three quick beats of the hero Bochur, each with a small seed of light appearing in a tiny flower pot he holds/places on a windowsill: (a) he hurries in through the study-hall door as a plain round wall clock (no numbers, just two hands) points up; (b) he sits and reviews in an open gemara (grey strokes, no letters); (c) he stands davening, swaying gently. Cuts or whip-pans between beats |
| s05 | 70 - 85.8 | you water it, it grows, months pass and you say: I grew | on the study-hall windowsill a row of small clay pots; the Bochur waters his pot with a little watering can; time-lapse light sweeps across the room (sun moves, pure function of t) and a small green shoot rises; he smiles. Slow orbit |
| s06 | 85.8 - 100 | (bamboo) you water and water, and it does not grow, you see nothing - just earth | outdoors: a single patch of bare earth in a garden bed with a small marker stick (plain wood); the Bochur kneels and waters it again and again; the light cycles day-night-day quickly (sky colour, pure function of t), the earth stays bare; he looks puzzled but keeps watering |
| s07 | 100 - 115 | then, after months, half a year - suddenly something grows, and then it grows very very fast | a bamboo shoot pokes out, then shoots up rapidly into tall segmented green bamboo stalks (several, growing on a smooth curve, pure function of t), leaves unfurl; the Bochur stumbles back amazed, looking up; camera cranes up along the stalks into a bright sky |
| s08 | 115 - 131.5 | what happened all that time? the roots grew deep, deeper, deeper | cutaway cross-section view: the ground becomes a cut-away slice showing brown soil layers; a glowing golden root network spreads deeper and wider beneath the bare patch (pure function of t, root length grows), while above ground the surface stays still; camera slowly descends along the roots |
| s09 | 131.5 - 149 | what is the rain for us? the farmers look at the sky and wait for rain; in the village they note every day how much fell | the farmer (Man) stands at the edge of his field looking up at the sky with a hand shading his eyes; grey-white clouds gather; beside him a plain clear rain-gauge tube on a post (no marks) slowly fills with blue water (pure function of t); camera pulls back from his face to the wide sky |
| s10 | 149 - 166.8 | the farmer is a partner - he waters - but without help from Hashem it cannot grow | gentle warm rain falls over the whole field (sunlit rain, golden backlight, a soft rainbow-free glow from above); green rows sprout across the field all at once; the farmer opens his hands, palms up, face lifted, smiling. Slow crane up and wide |
| s11 | 166.8 - 182 | you feel stuck, you ask a friend to help; yesterday I asked a bochur who learned with me two years: how did you do it? | the study hall: RabbiA sits beside an older Bochur at a table; RabbiA gestures questioningly (open hands); the Bochur thinks, then smiles shyly. Slow push-in, two-shot |
| s12 | 182 - 199 | he said: first of all, I prayed for it every day | early morning study hall with soft light through the windows: the Bochur stands alone at his place with a siddur (closed book, plain cover), eyes closed, davening; a few short dissolves of the same pose with the window light changing (several days, pure function of t) |
| s13 | 199 - 212.6 | Hashem, help me have understanding - and He opens the understanding | from above a soft beam of warm light falls on the Bochur; he opens an old gemara (grey strokes) and the page glows warmly; his face lights up with understanding, he nods eagerly. Slow orbit |
| s14 | 212.6 - 228.4 | in summary - this is the season of sowing; we sow all kinds of seeds; some see results sooner, some later | a long row of bochurim, each with a clay pot on a long table in the sun; the shoots in the pots are at different heights - some tall, some tiny, one still bare - and all grow slowly (pure function of t); camera dollies slowly along the row |
| s15 | 228.4 - 246.5 | do not give up; believe in Hashem and wait for the abundance to come down | back on the farm field from s01, now green and full: the farmer and the hero Bochur walk side by side along a green row toward the camera at golden hour, a light gentle rain catches the sun; camera pulls back and cranes up to a very wide calm hold of the green valley (242.5-246.5 = hold, gentle drift only) |

Seams: s01-s02 one field; s02->s03 dissolve via water sparkle; s03-s05 one study hall; s05->s06 dissolve; s06-s08 one
garden bed (s08 is a cut-away of the same bed); s08->s09 dissolve via golden light; s09-s10 one field; s10->s11
dissolve; s11-s13 one study hall; s13->s14 dissolve via the light; s14->s15 dissolve.

## Verify and report
Run `python C:/projects/_studio-animatzia/tools/verify_scene.py <absolute path of film_a.html> --timeout 900`; it must PASS
(zero P0/P1). Copy the PASS VERIFY_REPORT.json to the production root if it was written elsewhere. Then make stills
(JPG only, never PNG) of the middle of every shot and LOOK at them: kippa visible, no figure cut, no blank first frames,
nothing in the bottom 20%, no readable text. Fix and re-verify (batch fixes, one full verify; use --shot for small
checks). Do NOT render video. Make one JPG contact sheet of all 15 mid-shot stills at `_final_stills/sheet.jpg`
(see siach_20261029/_sheet.py). Report in English only (no Hebrew), with the path of the sheet and the final VERIFY
status. Do not spawn sub-agents unless essential, and then one cheap, well-defined one.
