# k08 "Whose servants are we really?" - a 3D film for the series "Katzar VeLainyan" (brief for the builder)

This is the picture track for a 5:02 audio lesson by Rav Avshalom Schneider (parashat Mishpatim, the Hebrew slave).
The rav's voice and the captions are added LOCALLY afterwards (they never go to the remote server). Your film has NO captions,
NO title card, NO kicker and NO recap: `film({ shots:[...] })` with `caps: []` in every shot. Audience: Haredi families on YouTube.

## Engine, rules, quality bar
Exactly as in `C:/projects/_studio-animatzia/productions/toldot06/BRIEF.md` - READ IT FIRST (engine API, characters,
modesty, camera, quality bar). Engine: `C:/projects/_studio-animatzia/lib/stage3d.js` (read it once). Characters:
`lib/people_pro.js` (read the top comment). Copy the page head from `../k07_kodesh/k07.html` (same imports work from this
folder). You MAY import and reuse `../azamra342/shul.js` (`buildShul`, `buildVillage`, `buildDryland`) and
`../azamra342/road.js`, and you may READ `../k07_kodesh/k07lib.js` / `k07fx.js` and `../k06_sinai/k06lib.js` for helpers (copy what
you need into your own `k08lib.js`; do not import from k06/k07). Do not edit files outside this folder. Do not put any audio or
image of people in this folder (the whole folder is uploaded to a public server).
Output: `C:/projects/_studio-animatzia/productions/k08_avadim/k08.html` (one file, all shots) + optional `k08lib.js`.
`render_parts.py` is already here - do not run it.

## Hard requirements
1. TOTAL LENGTH = exactly 302.51 s (sum of shot durations below; `window.__dur` must print 302.51). Keep the durations exactly.
2. Bottom 22% of the frame (y > 840 of 1080) is reserved for captions burned in later: no faces, no labels there.
3. Men and boys only, modest Haredi dress. NO women or girls at all (the audio mentions "his wife" - do NOT show any woman, not even
   far away or as a silhouette). Never depict Moshe Rabbeinu, a prophet, angels, or anything representing Hashem (only light/glow).
   Pharaoh is NEVER shown as a figure - only his empty throne / palace. No statues, idols, Egyptian gods, hieroglyph faces, sphinx,
   crosses, churches, mosques. No real rabbi's likeness. No violence: the ear-piercing is NEVER shown (no awl near a person).
4. Labels in the world - only these, only where listed: "פרשת משפטים", "רש\"י", "שולחן ערוך". Nothing else written anywhere
   (screens and billboards are BLANK colored glow, never text, never images of people).
5. LOOK - must be clearly DIFFERENT from k06 (golden desert + blue sky) and k07 (green hills, peach dawn, amber interiors).
   k08 palette: LATE AFTERNOON / SUNSET. Outdoors: terracotta and dusty-rose clay, sand-rose stone, warm coral-apricot sky with
   lilac high clouds, long soft shadows; accents of TURQUOISE (painted doors, shutters, tiles). Indoors: soft sea-blue/turquoise
   plastered walls with warm walnut wood and copper lamps. Egypt shots: rose-terracotta mud-brick in a hazy apricot haze.
   Modern shots (11-13): a clean pastel plaza at dusk, glows in soft rose/teal - never neon-harsh, never dark or gloomy.
6. Camera always moving smoothly; at least one striking move per shot (orbit, crane, dolly-through, rise). Everything a function
   of t only (use `rng(seed)`).
7. Recurring elements (same LOOK objects everywhere):
   - The RAV (speaker) only in shots 1 and 18: short black jacket, kippa, round glasses, grey-white beard
     (`{coat:'#1d1d24', beard:'#a7a199', beardLen:.55, hat:'kippa', hatColor:'#101014', skin:'#efcfb0', glasses:true}`),
     `perform:.8` and `talk` moving. Big in frame (faces must be readable - medium shots, not tiny).
   - The EVED: a young man with a SHORT brown beard, white shirt, dark-brown vest, kippa - the servant in shots 3-4, 9-10.
   - The MASTER: an older man, grey beard, long dark-blue coat, black hat - kind-looking, never cruel.
   - The BACHUR: modern young yeshiva man (no beard: `beard:false`, black hat, white shirt, black jacket) in shots 11-17.
   - THE TURQUOISE DOOR: a wooden door painted turquoise in a sand-rose stone wall, with a small mezuzah case on the right doorpost
     that glows softly warm. Same door in shots 2, 10 and 18 (the "door of choice").
   - THREADS: thin grey-violet strings (like puppet strings) = servitude to people/things. They attach from above to the wrists and
     shoulders of a man. When he "remembers Hashem" they dissolve into sparkles and ONE broad warm golden beam from above remains
     on him (= servant of Hashem alone). Same visual every time.
   - THE INNER LIGHT (as in k07): a small warm golden-white glow in a man's chest; dims under the threads, brightens in the beam.

## Shots (dur s - what is said - what we see)
1. 20.55 - "The first section in parashat Mishpatim is 'when you buy a Hebrew slave'. A very interesting section. At first: he can
   sell himself, he has debts. But then, 'if the slave says: I love my master, my wife and my children - I will not go free'."
   -> Sunset over a hill town of sand-rose stone with turquoise shutters; camera glides down over roofs into a courtyard beit
   midrash; the RAV at a shtender (label "פרשת משפטים" small on its front), push-in to 3/4.
2. 20.00 - "So they say: 'his master brings him to the judges, to the door, the doorpost, and pierces his ear with an awl'. Rashi:
   why the ear, why the doorpost? 'The ear that heard: For Bnei Yisrael are servants to Me - and went and acquired a master for
   himself'." -> THE TURQUOISE DOOR in late light; an open book labelled "רש\"י" on a small stand beside it. Camera dollies slowly
   toward the glowing mezuzah. Then soft rings of golden light (a "voice heard") roll in from far mountains on the horizon across
   the scene toward the door. No person is pierced, no awl near anyone.
3. 21.00 - "Why not pierce him the first time? Simple: when a man owes money, surely he must indenture himself fully - he cannot say
   'I'll pay when I have money', he must indenture himself." -> A market street at sunset: the EVED stands before a wooden table
   with a small stack of coins and a ledger; the MASTER sits kindly behind it. The EVED lowers his head and then walks off beside
   the MASTER along the street. Slow orbit then tracking.
4. 13.10 - "But still, even when he sold himself as a slave, he is subjugated only to work for him, to repay his debt - but he remains
   a servant of the Holy One. That is the great novelty here." -> The EVED working at a workbench in the master's courtyard: ONE thin
   short thread from his wrist to the master's house (limited bond), while the broad warm golden beam from the sky stays on him and
   his inner light glows. Crane up from the bench to the sky beam.
5. 23.40 - "'I love my master, my wife and my children, I will not go free.' He likes this situation. A good situation, nice. He has a
   house; the master's pillow - the good one is his; the master's bed - the good one is his; all improved conditions; he has a good
   wife; they support him." -> A cozy room in the master's house (sea-blue walls, walnut, copper lamp): a soft bed with a plump
   pillow, a table with bread and fruit; the EVED sits relaxed and content. Slow glide through the room ending on him. NO woman.
6. 8.10 - "Israel left Egypt, the house of slaves. Israel were slaves - a reality of a slave." -> Egypt in apricot haze: rose mud-brick
   walls, men in simple modest clothes carrying clay bricks in a line (calm, no whips, no taskmasters shown). Crane over them.
7. 15.40 - "Chazal write: who said the first verse we say in Hallel, 'Praise, servants of Hashem'? Pharaoh said it: until now - my
   servants, and now - servants of Hashem." -> An Egyptian palace hall at dusk with torches (columns plain, NO statues, NO carvings of
   figures), an EMPTY throne seen from behind; the great doors swing open and far outside the people are walking out toward the
   sunset light. Camera passes the throne and flies through the doors.
8. 25.10 - "What does this saying mean? Did Pharaoh suddenly discover a fact we all know? No - the answer is different. Pharaoh enslaved
   Israel so that in the end they could be servants of Hashem. He prepared them to be without ego, without self - only Hashem's will
   dictates their ways." -> A heap of rough clay bricks; the bricks lift and rearrange themselves into a long stepped stair rising
   toward a soft radiance in the sky (light only). Small figures of men walk up the stair. Long rising dolly along the stair.
9. 9.70 - "All that for 400 years we were slaves was so that in the end we'd become servants of Hashem." -> Time-lapse over the brick
   fields: the sun sweeps across the sky several times (shadows swing), then the haze clears into a column of warm light. Slow orbit.
10. 22.34 - "But when a man is a slave, a slave's nature stays in him. When a man is sold as a slave - chalila - this nature can return:
    it suits me to be without responsibility, without inner will; I'm fully under my owners." -> The EVED back in the cozy room on
    the soft bed; THREADS descend from above and attach to his wrists and shoulders; he slumps comfortably; his inner light dims a
    little. Camera circles him slowly and closes in to 3/4.
11. 10.90 - "Six years you may work the first time; but the second time, when six years have passed and you say 'this is comfortable
    for me' - you forgot that you are only a servant of Hashem." -> Six small copper lamps on a shelf light one after another; then
    the EVED stands at THE TURQUOISE DOOR, hesitating at the doorpost, warm light pouring in from outside. Push-in.
12. 15.75 - "Today too, we are all servants. There is one who is a servant to Hashem's will; he cares about one thing: what does Hashem
    demand of me? I don't move a finger without the Shulchan Aruch." -> A modern beit midrash (sea-blue walls, walnut, copper lamps):
    the BACHUR at a table with an open sefer labelled "שולחן ערוך", the golden beam on him, inner light bright. Camera 180 arc.
13. 13.15 - "And there are people who are slaves to the media, to trends, to the surrounding atmosphere - that is also a slave. He feels
    free to do whatever he wants - let him know: there is no such thing." -> A clean pastel plaza at dusk with tall BLANK glowing panels
    (rose/teal glow, no text, no pictures); men walk by; from every panel thin THREADS run to the passers-by, who don't notice. Camera
    dollies through the plaza.
14. 19.30 - "When a man is swept along and dragged and he likes it, he becomes a slave of something else. Everyone is a slave. We must be
    servants only of Hashem, and the temporary servitudes we fall into must not find favor in our eyes." -> A gentle river at sunset
    carrying leaves and little paper boats downstream; the BACHUR on the bank, threads on him pulling toward the current; he looks up,
    the threads dissolve into sparkles, the golden beam lands on him. Crane up and around.
15. 11.80 - "We are supposed to get dressed, okay? Bound - call it - to the laws of the surroundings: one must walk dressed." -> A tidy
    walnut wardrobe opens: neat men's dark suits, white shirts and black hats on pegs, modest and orderly, soft copper light. Dolly in.
16. 13.30 - "But must we be enslaved to fashions? We must look good, we must be enslaved to fashions that dictate how to dress, how to
    look; we must all look the same." -> A conveyor of identical grey hats and coats sliding past in a long row, each one pulled by a
    THREAD from a large blank glowing panel above; everything identical and slightly grey. Camera tracks along the row.
17. 15.10 - "...my master who rules over me, the way they engineer my consciousness - must I stay a slave of that? Chas vechalila!"
    -> The BACHUR stands before a huge slow clockwork of grey gears and blank panels sending threads toward him; he steps back, the
    gears halt and crumble into dust, light floods in. Push-in, then a fast-but-smooth pull-back.
18. 24.52 - "Remember: you are a servant only of the Holy One. Don't let anyone engineer your mind, your worldview, by all kinds of
    things... and may we have a share: servants of Hashem, only servants of Hashem, in all our ways. All the best." -> The courtyard
    from shot 1 at golden sunset: THE TURQUOISE DOOR open, mezuzah glowing; the BACHUR walks out through it into the warm light under
    the golden beam; the RAV at his shtender nearby, smiling (`perform`, `talk`); final pull-back up over the sand-rose town at sunset.
Sum: 20.55+20+21+13.1+23.4+8.1+15.4+25.1+9.7+22.34+10.9+15.75+13.15+19.3+11.8+13.3+15.1+24.52 = 302.51.
NOTE: the shot numbers above are the final order (18 shots).

## Stills and checking
`cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/k08_avadim/k08.html productions/k08_avadim/_stills --times <comma-separated, 2 per shot> --sheet productions/k08_avadim/_stills/sheet.png --cols 4 --timeout 900`
Then: `PYTHONIOENCODING=utf-8 python tools/safe_view.py productions/k08_avadim/_stills --out productions/k08_avadim/_view --sheet 4`
🔴 NETFREE: NEVER Read a .png. Read ONLY the JPG files that safe_view printed as CLEAN (in `_view/`). Never Read anything in `_stills/`.
Check critically: faces visible and readable (prefer 3/4 / front), nobody floating or sunk, camera not inside objects, nothing
important in the bottom 22%, no women, no Pharaoh figure, no statues, labels spelled exactly as listed. Fix and re-run until good.
Do NOT render video (the render runs on remote servers afterwards). Work economically: read each engine file once, keep outputs short.

## When you finish
Report: file path, `__dur`, shot list with camera move in each, which stills you checked, and what you still do not like.
