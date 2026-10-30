# katzar_k04_3d - BRIEF (supervisor, 30/10/2026)

A 3D cel-shaded cartoon film (16:9, 1920x1080, 30 fps) that ILLUSTRATES a ~3.4 min recorded talk by a rabbi
(his real voice is the narrator; it is mixed in LOCALLY later - the page has NO audio and NO captions; captions are burned in later).
Characters act and react; NOBODY lip-syncs the rabbi's words. Background talk mouths are allowed only in short "conversation" beats.

## Method (approved look - copy, never start from zero)
- Read `~/.claude/skills/video-production/references/cartoon_style.md`.
- Cast of 3D animals/objects: `C:/projects/_studio-animatzia/lib/toon3d/cast.js` + `toon3d.js` (CAST.donkey, cow, goat, sheep, camel,
  dog, rooster, lion, sefer, kettle, stone, coin; viewer example `productions/cast3d/view.html`).
- Camera/stage reference: `productions/animals3d/` (2.5D multiplane, cinematic camera moves) and `productions/donkey3d/index.html`
  (toon shader, ink outline, background hills/fence/trees, walk cycle).
- People: `productions/haredi_man/man3d.js` (being improved tonight - import it through ONE adapter file `people.js` in this folder that
  exports makeMan(), makeBochur(), makeBoy(), makeRabbiA(), makeRabbiB() - for now all may return the man with scale/colour variants;
  the supervisor will swap in the new cast models later, so keep every person behind this adapter and use only its public API).
- Props needed (build simple, in the same toon style, in `props.js`): wooden ark (big boat-house with a ramp and a door), open gemara
  (big book, no readable letters - just grey line strokes), shtender (lectern), table with a stack of sefarim, bench, warm
  study-hall interior (wood walls, window, hanging lamps), stone house, rain, dark swirling storm clouds, rising water, rainbow.
- Deterministic page contract: `window.__dur` (seconds), `window.__seek(t)` renders frame t synchronously (pure function of t, no
  Date/real time, seeded random only), `window.__ready=true` when assets are built; `?t=12.3` freezes; `?capture` hides UI;
  `?hq=1` / window.__HQ_RENDER = full quality. Check an existing seek page in the engine (grep -r "__seek" productions/*/film_*.html)
  and `tools/verify_scene.py` / `tools/render_all.py` docstrings for what they expect.

## Modesty / respect rules
Men and boys only. No crosses/churches. The two older rabbis are GENERIC kind elderly rabbis - not portraits of anyone, no name labels.
No readable text in the picture (no letters at all - captions come later). The "temptation of the street" is shown ONLY abstractly
(blinking coloured light blobs, noise squiggles, wind, swirling arrows, puddles) - never people, never images of shops/screens content.
Leave the bottom 20% of the frame calm (captions go there): no key action below y=80% of frame.

## Timeline (film time t, seconds; film length __dur = 211.0)
Voice starts at t=3.5 and ends at t=207.0. 0-3.5 = title moment (music only): slow crane down to the ark on a hill at dawn, empty
space at the top-centre for a title burned in later. 207-211 = final wide hold.

| shot | t (film) | what the rabbi talks about | what we SEE |
|---|---|---|---|
| s01 | 0 - 13.6 | whoever reads the weekly portion of Noah wonders - a phrase repeats in many places | crane down to the ark on a green hill, grey sky far away; a man (makeMan) reading an open gemara at a shtender on a hill-top porch, looks up surprised, scratches head |
| s02 | 13.6 - 29.8 | "a man and his wife" - what does it mean? the Talmud (Sanhedrin 108) asks it | animal PAIRS walk up the ramp into the ark side by side: two donkeys, two sheep, two camels, two roosters (walk cycles, feet planted, slight stagger in timing). The SEFER character (from CAST) appears on the side with a raised-brow "question" face at ~21-26 |
| s03 | 29.8 - 42.4 | Rashi: they did not join with other kinds. Still hard: why call it that? | close on two pairs at the ramp; a goat wanders towards the sheep pair and turns back to its own goat partner; each pair stays together. Back to the sefer, puzzled face at ~36-42 |
| s04 | 42.4 - 63.2 | the Aruch explains: it would be a time of confusion and mixing, everyone went astray; they overcame that confusion - such a hard test | sky darkens, wind, swirling storm clouds, leaves flying, animals of the world scattered in confusion (fast whip-pans, swirling arrows); then the pairs walk calmly through the wind to the ark - camera follows one donkey pair low and close |
| s05 | 63.2 - 84.0 | so "a man and his wife" means DEVEKUT - real attachment: turning away from bad, joining what one should, by nature. A wonderful novelty | inside the warm ark: the pairs settle side by side, a soft warm glow ring links each pair; slow push-in; at ~80 the glow brightens (sparkle) |
| s06 | 84.0 - 125.9 | R' Yaakov Galinsky brings a lesson for each of us: he asked R' Chaim Kanievsky - can I reach the attachment of R' Akiva Eiger? surely not. But today the temptation of the street is terribly hard. Can one say that whoever overcomes it becomes attached to the Torah like a man and his wife? | warm study room, table with sefarim, lamp. RabbiA (visitor, walks in, sits) and RabbiB (older, seated) - seen at a respectful mid distance. ~97-105: RabbiA gestures up to a tall golden staircase that rises behind them into light (a far high summit with a glowing open book) and shakes his head humbly. ~105-116: through the window: wind, rain and blinking coloured light blobs outside (abstract street chaos). ~116-125: RabbiA points from the window back to the gemara, open hands, asking |
| s07 | 125.9 - 129.2 | he said: correct, that is what the sugya says | RabbiB smiles warmly and nods, hand on the gemara; RabbiA's face lights up |
| s08 | 129.2 - 159.0 | a yeshiva student, a young married scholar, who turns away from bad - bad raging in the streets, a confused person who does not know where to go - and he turns away. True, he does not reach the ideal attachment, but he turns away from this frightening flood. So he is called "a man and his wife" - attached to his Torah | night street of stone houses in rain; the Bochur walks with his gemara under his arm; at a crossroads blinking coloured blobs and swirling arrows pull in two directions (he stops, looks both ways ~137-140), then he turns firmly towards a warm lit study-hall door. ~145-152: water rises in the street behind him (flood metaphor, not dangerous-looking for kids, just rising puddles/waves); he steps inside, the door closes the storm out. ~152-159: he sits at a shtender, opens the gemara, a warm glow ring links him and the book |
| s09 | 159.0 - 176.0 | how much we must remember: when you overcome a test - attachment to Him and His Torah, as if you reached the very highest level | slow orbit around the Bochur learning; the golden staircase from s06 appears faintly behind him and light runs up to the top; he looks up, peaceful smile |
| s10 | 176.0 - 193.0 | these precious words lift us to know the value of our work - not to feel low and small, thinking we are nothing. No, no, no! this test of turning from the raging confusing bad - see its wonderful worth | the Boy (makeBoy) at a bench in the study hall looks small (camera high above him, he slumps, sad); at ~184-188 ("No no no") camera swings down to eye level, the Man (makeMan) puts a hand on his shoulder, the boy straightens up and smiles; ~189-193 the boy holds his gemara proudly |
| s11 | 193.0 - 211.0 | Sanhedrin 108, in the Aruch, says this foundation, and on it R' Yaakov built this wonderful foundation: each of us can be "a man and his wife" of the holy Torah | wide: study hall window opens to the ark on the hill under a rainbow, animal pairs outside; inside the Man, the Bochur and the Boy each with an open gemara, glow rings; slow pull-back and crane up; 207-211 hold on the final wide |

## Quality bar
Every shot has a purposeful camera move; characters walk with real cycles (no sliding), gesture, blink, change expressions.
Faces readable (characters at least 1/4 of frame height in character beats). Feet on the ground with contact shadows.
Nothing important cut by the frame edge. Bright warm cartoon palette (storm beats darker but still friendly, not scary).
