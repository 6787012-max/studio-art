# k06 "Maamad Har Sinai - the truth we pass on" - a 3D film for the series "Katzar VeLainyan" (brief for the builder)

This is the picture track for a 4:11 audio lesson by Rav Avshalom Schneider (parashat Yitro). The rav's voice and the
captions are added LOCALLY afterwards (they never go to the remote server). Your film has NO captions, NO title card,
NO kicker and NO recap: `film({ shots:[...] })` with `caps: []` in every shot. Audience: Haredi families on YouTube.

## Engine, rules, quality bar
Exactly as in `C:/projects/_studio-animatzia/productions/toldot06/BRIEF.md` - READ IT FIRST (engine API, characters,
modesty, camera, quality bar). Engine: `C:/projects/_studio-animatzia/lib/stage3d.js` (read it once). Characters:
`lib/people_pro.js` (read the top comment). Copy the page head from `../azamra342/_head_example.html` (paths `../../lib/...`
work from this folder too). You MAY import and reuse `../azamra342/shul.js` (`buildShul(Wd,o)` beit knesset interior,
`buildVillage`, `buildDryland`) - read `../azamra342/film_a.html` for how it is used. Do not edit files outside this folder.
Output: `C:/projects/_studio-animatzia/productions/k06_sinai/k06.html` (one file, all shots). Extra modules you write: in this folder.

## Hard requirements
1. TOTAL LENGTH = exactly 250.63 s (sum of shot durations below; `window.__dur` must print 250.63). The shot boundaries
   follow the narration, so keep the durations exactly as listed.
2. The bottom 22% of the frame (y > 840 of 1080) is reserved for the captions that are burned in later: nothing important there
   (no faces, no labels). Keep horizons / key objects in the upper 3/4.
3. Men and boys only, modest Haredi dress. NO women or girls at all. Never depict Moshe Rabbeinu, a prophet, angels or
   anything representing Hashem: the revelation is shown ONLY by fire, thick cloud (arafel), light, rings of sound, the shofar-like
   glow; a path going up into the cloud is fine, a figure on the mountain is NOT. No crosses/churches/mosques, no idols.
4. Labels in the world: only these short words, and only where listed: "הר סיני", "פרשת יתרו", "ואתחנן", "רמב\"ן", "רמב\"ם",
   "ספר המצוות", "דור", and the numbers of generations if you want ("דור 1" ... no other text).
5. Warm and soft, NOT metallic: desert sand/ochre, deep sky blue, warm gold light, olive-green for the tree. Daylight,
   except shot 9 (dramatic storm-light at Sinai, still readable, not black).
6. Camera always moving smoothly; at least one striking move per shot. Everything a function of t only (use `rng(seed)`).
7. Recurring characters (reuse the same LOOK objects everywhere):
   - FATHER: a Haredi man, black coat, black hat, dark beard (like RAV in the toldot06 brief, no glasses).
   - SON: a boy (toldot06 boy look, `{scale:.72}`).
   - The RAV (the speaker) appears only in shots 1 and 14: short black jacket, kippa, round glasses, grey-white beard
     (`{coat:'#1d1d24', beard:'#a7a199', beardLen:.55, hat:'kippa', hatColor:'#101014', skin:'#efcfb0', glasses:true}`),
     `perform:.8` and `talk` moving (he is speaking).
   - THE LANTERN: a warm glowing lantern = "the truth of Sinai" that is passed from hand to hand. Same object in every shot.

## Shots (dur in seconds - what is said - what we see)
1. 10.6 - "We have a special task this week, parashat Yitro. The Ramban writes in parashat Va'etchanan:"
   The rav in a warm beit midrash (shul.js) at a shtender, open sefer; slow push-in from a wide view to a 3/4 medium shot;
   label "פרשת יתרו" on the shtender front (small).
2. 21.0 - Ramban: "He warned in a negative commandment that we not forget anything of that event, never remove it from our heart;
   and commanded in a positive commandment to make it known to all our descendants, generation to generation - all that was
   there, seen and heard." -> Fly-in over a vast desert at golden hour to "הר סיני" in the distance (big, majestic mountain);
   the camera descends to FATHER and SON standing on a rise looking at it; the father lifts the LANTERN and hands it to the son
   (gesture offer). End on the lantern glow.
3. 17.0 - "The benefit is very great: if the Torah had come only from the mouth of Moshe, even though his prophecy was proven
   by signs and wonders - if a prophet or dreamer arose among us and commanded the opposite of the Torah, doubt would enter."
   -> Symbolic, no prophets shown: a tall stone pillar standing on a single thin support; small flickering sparks (signs) circle
   it; a big balance scale beside it starts to rock unsteadily; a crack runs up the pillar. Camera circles 270 degrees.
4. 8.2 - "But since the Torah came to us from the Mouth of the Almighty, to our ears, our eyes seeing, with no intermediary..."
   -> The foot of Har Sinai: a huge crowd of men and boys (instanced simple figures far away + a few people_pro figures near
   camera, FATHER and SON among them), all looking up; a column of warm light comes down from the summit straight to them.
   Crane up from the crowd to the summit.
5. 18.4 - "...we would deny every dissenter and doubter and call him a liar; no sign would help him and no wonder save him from
   death at our hands, for we know his falsehood." -> The pillar from shot 3 now stands on a broad mountain base, rock-solid;
   the sparks fly at it and bounce off / fade; the scale stands level and still. Camera: low hero angle, slow orbit, then rise.
6. 34.6 - "How do we know this? 'And they will also believe in you forever.' When we transmit it to our children they will know it
   is true without doubt, as if all generations saw it; for we will not testify falsely to our children, and they will believe
   that we all saw with our eyes." -> THE CENTRAL IMAGE: a long road from Har Sinai (far back, glowing) to the camera; along it a
   chain of fathers and sons (8-12 pairs, slightly different coats, older dress styles far back is NOT needed - all Haredi),
   each father passing the LANTERN to his son, the light travelling forward pair by pair (timed along the shot); optional small
   labels "דור" beside a few pairs. Camera flies low along the chain from the mountain toward today, then rises to show it all.
7. 17.0 - "Until here the Ramban. He repeats it in Sefer HaMitzvot, among the 'forgotten negative commandments' - he claims the
   Rambam forgot to count this prohibition: not to forget Maamad Har Sinai, which we read this week. And it says a great thing:"
   -> A library/beit midrash corner: two large seforim on a table with labels "רמב\"ם" and "רמב\"ן" and a third "ספר המצוות";
   a list of glowing small tablets (a row of mitzvot) where one empty slot lights up gold. Camera dolly along the shelves to the table.
8. 22.2 - "The faith is founded there, and that is our task: to pass Maamad Har Sinai to our children. Nothing else - not signs and
   not wonders, as the Rambam explains in chapter 8 of Yesodei HaTorah: we do not believe because of wonders, but because our own
   eyes saw." -> A building being built (a simple beit midrash house) whose foundation stone is a piece of Har Sinai (glowing
   seam); floating "wonder" sparks drift away and vanish; at the end the camera dives down to the foundation stone.
9. 14.9 - Rambam: "Our eyes saw, not a stranger's; our ears heard, not another's: the fire, the sounds and the torches; he
   approached the thick cloud and the Voice spoke to him, and we heard: 'Moshe, Moshe, go tell them thus and thus.'"
   -> THE BIG SINAI SHOT: the mountain wrapped in fire at the top, a heavy dark cloud (arafel) on the summit with light inside,
   torch-like flames, expanding rings of sound in the air (timed to "the sounds"), the crowd far below. A path leads up into the
   cloud (no figure). Camera: dramatic rising spiral around the mountain, ending above the crowd looking up.
10. 18.5 - "The holy Torah was handed to us as witnesses - a whole nation was witness to this event. One must always remember it
    and pass it on: this is the TREE that we all lean on; and make it our business." -> A huge, beautiful tree (olive-green, wide
    canopy) on a hill; its roots visibly run down into a glowing rock of Sinai; many men and boys sit and lean in its shade,
    learning; FATHER and SON with the LANTERN under it. Camera 360 orbit around the trunk.
11. 24.5 - "All the nonsense and confusion that people try to sell us, as long as they deviate from what we received at Sinai -
    we have no need to argue with it at all. The truth from Sinai has no changes, nothing changed at all." -> Same tree: a dusty
    wind of grey leaves / scraps / swirling dust blows at it from the side; the tree does not move, the people stay calm; the
    storm fades and the scene returns bright; two stone tablets (rounded tops, no writing) at the trunk, untouched. Camera: steady
    slow push-in through the swirl, then calm arc.
12. 5.7 - "And as we must pass it to our children, all the more so we must first pass it to ourselves." -> Close shot: the FATHER
    holds the LANTERN close to his own chest first (its light on his face), then turns to the son. Gentle orbit.
13. 36.3 - "The Ramban writes there: and if you say the verse about teaching your sons is said about Talmud Torah - why do I say it
    is about passing on the truth of the Torah? The Ramban says a sentence: learning the truth of the Torah, to learn this subject and
    set it in our hearts - that is complete Talmud Torah." -> A warm beit midrash at night-lit lamps but bright: FATHER and SON
    learning at a table, open gemara, the LANTERN on the table; through the window the far silhouette of Har Sinai at sunset.
    Several camera moves (seq): wide push-in, 180 arc around the table, slow rise; at "complete Talmud Torah" the lantern brightens.
14. 1.73 - "Shabbat shalom." -> Shabbat candles lit on a white tablecloth, the rav smiling in the background (blurred / far);
    a slow pull-back.
Sum: 10.6+21+17+8.2+18.4+34.6+17+22.2+14.9+18.5+24.5+5.7+36.3+1.73 = 250.63.

## Stills and checking
`cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/k06_sinai/k06.html productions/k06_sinai/_stills --times <2-3 times per shot> --sheet productions/k06_sinai/_stills/sheet.png --cols 4 --timeout 900`
Then: `PYTHONIOENCODING=utf-8 python tools/safe_view.py productions/k06_sinai/_stills --out productions/k06_sinai/_view --sheet 4`
🔴 NETFREE: NEVER Read a .png. Read ONLY the JPG files that safe_view printed as CLEAN (in `_view/`). Never Read anything in `_stills/`.
Check critically: faces visible (prefer side / 3/4 / front, not straight from behind), nobody floating or sunk, camera not inside
objects, nothing important in the bottom 22%, no women, no figure on the mountain. Fix and re-run until it is genuinely good.
Do NOT render video (the render runs on remote servers afterwards). Work economically: read each engine file once, keep outputs short.

## When you finish
Report: file path, `__dur`, shot list with camera move in each, which stills you checked, and what you still do not like.
