# k07 "Anshei Kodesh - a different reality" - a 3D film for the series "Katzar VeLainyan" (brief for the builder)

This is the picture track for a 4:59 audio lesson by Rav Avshalom Schneider (parashat Mishpatim). The rav's voice and the
captions are added LOCALLY afterwards (they never go to the remote server). Your film has NO captions, NO title card,
NO kicker and NO recap: `film({ shots:[...] })` with `caps: []` in every shot. Audience: Haredi families on YouTube.

## Engine, rules, quality bar
Exactly as in `C:/projects/_studio-animatzia/productions/toldot06/BRIEF.md` - READ IT FIRST (engine API, characters,
modesty, camera, quality bar). Engine: `C:/projects/_studio-animatzia/lib/stage3d.js` (read it once). Characters:
`lib/people_pro.js` (read the top comment). Copy the page head from `../k06_sinai/k06.html` (same imports work from this
folder). You MAY import and reuse `../azamra342/shul.js` (`buildShul`, `buildVillage`, `buildDryland`) and
`../azamra342/road.js`, and you may READ `../k06_sinai/k06lib.js` for helpers (copy what you need into your own
`k07lib.js`; do not import from k06). Do not edit files outside this folder. Do not put any audio or image of people in this
folder (the whole folder is uploaded to a public server).
Output: `C:/projects/_studio-animatzia/productions/k07_kodesh/k07.html` (one file, all shots) + optional `k07lib.js`.

## Hard requirements
1. TOTAL LENGTH = exactly 298.96 s (sum of shot durations below; `window.__dur` must print 298.96). The shot boundaries
   follow the narration - keep the durations exactly as listed.
2. Bottom 22% of the frame (y > 840 of 1080) is reserved for captions burned in later: no faces, no labels there.
3. Men and boys only, modest Haredi dress. NO women or girls at all. Never depict Moshe Rabbeinu, a prophet, angels or anything
   representing Hashem (only light, cloud, glow). No crosses/churches/mosques, no idols. No real rabbi's likeness.
4. Labels in the world - only these, only where listed: "פרשת משפטים", "רמב\"ן", "רס\"ג", "מסכת סופרים", "אבני נזר",
   "הר סיני". Nothing else written anywhere (books have no readable titles except these labels).
5. LOOK - must be clearly DIFFERENT from k06 (k06 = golden desert + Sinai + blue sky). k07 palette: soft green hills of
   Eretz Yisrael in early morning (mint/sage green, peach-pink dawn sky, cream stone houses) for outdoor shots, and warm
   amber-honey interiors (wood, lamplight, cream walls) indoors. Warm and soft, NOT metallic, never dark/gloomy.
6. Camera always moving smoothly; at least one striking move per shot (orbit, crane, dolly-through, rise). Everything a
   function of t only (use `rng(seed)`).
7. Recurring elements (same LOOK objects everywhere):
   - The RAV (speaker) only in shots 1 and 15: short black jacket, kippa, round glasses, grey-white beard
     (`{coat:'#1d1d24', beard:'#a7a199', beardLen:.55, hat:'kippa', hatColor:'#101014', skin:'#efcfb0', glasses:true}`),
     `perform:.8` and `talk` moving. Main figure big in frame (faces must be readable - medium shots, not tiny).
   - The BACHUR: a young yeshiva man (no beard: `beard:false`, black hat, white shirt, black jacket) - the "us" of the film.
   - THE INNER LIGHT: a soft warm glow (a small light/sphere of golden-white) inside the bachur's chest = his holy
     neshama. It brightens when he does good / learns, dims a little with coarse things. Same visual every time.
   - THE LOAF: a round golden challah-like loaf on a wooden board = "bread / Torah is food for the soul".

## Shots (dur s - what is said - what we see)
1. 13.9 - "We are in parashat Mishpatim; there is a wonderful verse: 'And holy men you shall be to Me; and flesh torn in the
   field you shall not eat - throw it to the dog.'" -> Dawn over green hills, a small cream-stone yeshiva building; camera
   flies in through the window to the RAV at a shtender (label "פרשת משפטים" small on the shtender front), push-in to 3/4.
2. 6.2 - "What is the problem with eating such things? Why is it forbidden? What does it have to do with 'holy men'?"
   -> Outside: a field fence at the edge of the hills; a shepherd dog (calm, friendly) sits by a gate; a simple covered
   bowl beside it. The BACHUR stands looking, puzzled (`think` pose). Slow orbit.
3. 17.0 - Ramban: "Until now He mentioned the laws and warned about ugly deeds - things forbidden to DO. But here He speaks about
   forbidden foods: what is the problem with eating things that nourish me?" -> A long wooden table in a warm room; on it, in a
   row, simple symbolic objects lit one after another (a scale = laws, a closed door = forbidden deeds); then the camera glides
   to the end of the table where plates of food appear. A large book with label "רמב\"ן" open at the head of the table.
   Dolly along the table.
4. 21.6 - "He said: be holy men to Me. ... There is no prohibition in foods except purity of the soul: that you eat clean
   things that do not produce thickness and coarseness in the soul." -> The BACHUR seated, a clean bright plate before him
   (fresh bread, fruit). Visualize his INNER LIGHT clear and bright; beside it a "coarse" alternative shown as a grey, murky
   cloud that would dull the light (the cloud drifts near and the light dims slightly, then the clean plate and the light
   returns stronger). Camera: slow arc to a close 3/4 on him, light glowing on his face.
5. 22.6 - "'I want you to be holy men, in order that you be Mine. I need you, I want you, to be holy to Me, fit to cleave to Me,
   for I am holy. So do not make your souls loathsome by eating abominable things.'" -> Outside at sunrise: many men and boys
   on a green hillside, each with a small INNER LIGHT; the lights rise softly as warm motes up toward a gentle radiance in the
   sky (light only, no figure). Crane up from the people to the sky glow and back down.
6. 24.9 - "A great foundation in the Ramban: Israel are fit to be a completely different reality. They are not ordinary people
   who were commanded Torah and mitzvot as some recipe for a nice life, a happy life, a moral life..." -> Contrast: a plain
   village street of ordinary houses (neutral, slightly dull colors), then the camera rises over a hill to reveal a radiant
   distinct place: a cream-stone town with a glowing beit midrash in the middle, everything warmer and brighter (the "other
   reality"). Long rising dolly.
7. 15.8 - "...like everyone, like all the nations, but with some elevated lifestyle - chas veshalom! Israel are another reality,
   a completely different thing." -> Two objects on a table: an ordinary clay jug with a golden ribbon tied on it (= ordinary
   thing with an added decoration) shatters into dust/fades away; in its place appears a whole new vessel made of light (glass
   with golden glow inside) - "a different thing entirely". Camera 270-degree orbit.
8. 17.36 - "Our reality is a reality of holiness. So explains Rabbeinu Saadia Gaon: why was there resurrection at Har Sinai?
   He could have done a miracle that when they heard the Commandments their souls would not fly out..." -> Book with label
   "רס\"ג" open on a lectern in a warm library, then match-cut through its glowing page to a far view of a mountain with label
   "הר סיני" in the distance at dawn (soft mist, NOT the golden desert of k06 - here a cool-peach dawn mist), a crowd far below.
9. 31.02 - "...so why the resurrection? To teach that the Torah is not an addition onto them: at Sinai a new thing was created, a
   new reality of Am Yisrael, who without Torah are no reality at all. Not an ordinary man who left Egypt and then gets a
   spiritual dimension - but a new reality that cannot exist without the Torah. That is why resurrection was needed: to create
   this new reality." -> The crowd at the mountain foot: a wave of soft light washes over them from the mountain; every person's
   INNER LIGHT ignites at once (golden motes gather and enter them) - symbolic "new creation", calm and beautiful (nobody falls,
   nothing scary). Camera: low among the crowd, then a slow rising spiral to show the whole crowd glowing like a field of
   lamps.
10. 15.37 - "Shut Avnei Nezer, wonderful: why in Masechet Sofrim is the prohibition of throwing food from place to place taught
    together with the prohibition of throwing holy writings - why together?" -> A warm beit midrash table: on one side THE LOAF
    on its board, on the other a stack of seforim; two open books labelled "אבני נזר" and "מסכת סופרים". A hand places the loaf
    gently, and a sefer gently. Camera slides between them, ending framing both side by side.
11. 30.0 - "'Because man lives on bread; all the more so holy writings, by which man lives eternal life.' As bread is the life of
    the body, so Torah is the food of the soul. So Masechet Sofrim put together the law of bread and of holy writings - both may
    not be thrown; it matters for laws of geniza etc." -> The BACHUR at the table: he eats a piece of the loaf (body), then opens
    the gemara and his INNER LIGHT brightens (soul). Visual rhyme: warm glow on the loaf and the same glow rising from the open
    gemara. End: a wooden geniza box where old pages are laid respectfully. Several moves (seq): push-in, arc, top-down.
12. 12.28 - "But the foundation here: Israel are another thing entirely. The more you understand this foundation, your life
    looks completely different." -> The BACHUR walks out at morning along a path in the green hills; with each step the
    landscape around him becomes brighter and more colorful (flowers open, light warms). Tracking shot beside him.
13. 26.9 - "Not that Torah is a burden, not that it opposes nature - as many think: 'I want to live freely... we submit, okay,
    we don't want trouble.' Chas vechalila! Torah is the recipe for the basic, Jewish form of life." -> First a grey, heavy
    stone yoke hangs in the air over the path (the wrong view) - it cracks and dissolves into light; then a young plant grows
    naturally from the ground into a strong green tree whose trunk is shaped by the light of an open sefer at its root (Torah
    as the natural "recipe" of our life). Camera: push-in to the yoke, then follow the growing tree upward.
14. 25.7 - "This is our approach: Torah is life, our vitality. Learning Torah is not acquiring some external wisdom; I must
    meet MYSELF in the Torah, it speaks to me. It is bread: as a person loves to eat, Torah is to live, to give life to our
    inner part." -> The BACHUR learning in a warm beit midrash; reflected softly in the glowing page we see his own face/silhouette
    (he "meets himself" in the Torah); his INNER LIGHT and THE LOAF glow together on the table. Slow 180 arc, then a gentle
    push-in on his face lit by the page.
15. 18.33 - "And as we have seen - hard to speak about ourselves - but as we see our great rabbis, for whom this is their very
    life, that is how they look at the holy Torah. All the best; may we merit to receive a share of these things." -> An elderly
    rav (white beard, NOT the speaker look, seen from 3/4 at a distance, NOT a real person's likeness) learning by lamplight,
    surrounded by young men listening, everyone's INNER LIGHT glowing; final pull-back through the window out to the dawn hills,
    and the RAV (speaker) at the end, smiling, small in the warm window.
Sum: 13.9+6.2+17+21.6+22.6+24.9+15.8+17.36+31.02+15.37+30+12.28+26.9+25.7+18.33 = 298.96.

## Stills and checking
`cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/k07_kodesh/k07.html productions/k07_kodesh/_stills --times <2-3 times per shot> --sheet productions/k07_kodesh/_stills/sheet.png --cols 4 --timeout 900`
Then: `PYTHONIOENCODING=utf-8 python tools/safe_view.py productions/k07_kodesh/_stills --out productions/k07_kodesh/_view --sheet 4`
🔴 NETFREE: NEVER Read a .png. Read ONLY the JPG files that safe_view printed as CLEAN (in `_view/`). Never Read anything in `_stills/`.
Check critically: faces visible and readable (prefer 3/4 / front), nobody floating or sunk, camera not inside objects, nothing
important in the bottom 22%, no women, no figure on the mountain, labels spelled exactly as listed. Fix and re-run until good.
Do NOT render video (the render runs on remote servers afterwards). Work economically: read each engine file once, keep outputs short.

## When you finish
Report: file path, `__dur`, shot list with camera move in each, which stills you checked, and what you still do not like.
