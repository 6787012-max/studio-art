# BRIEF - film_siach: morning talk 23/10/2026 (Mechina Beit HaTalmud) - a 3D film for the builders

Source: the real morning talk in the beit midrash (recorded audio). The REAL VOICE of the speaker plays under the whole film (4 clips, mixed locally later - do NOT add any audio to the page). The picture must act out what is said; captions summarise it (Hebrew, ids only for builders).
Audience: Haredi boys, mechina age 13-17. Shown with the real talk audio + soft music.
Central idea: prayer is a connection. Parable of the apple (who eats to bless vs who blesses to eat); when everything is good we drift away, a difficulty comes from love so we come back; no prayer is ever lost - Hashem keeps them in a treasury and releases them at the right moment; closing: do not be afraid to succeed, nobody has a prayer like yours.
Engine, rules, quality bar: exactly `C:/Users/<user>/.claude/skills/video-production/references/builder_kit.md` and reference productions `productions/azamra342/` (head from `_head_example.html`, patterns from `road.js`, `shul.js`, `film_e.html` interior) and `productions/siach_noach1/film_siach.html` + `shared.js` (same series, same look - COPY its boy look, palette, coin/heart helpers).
Output: ONE page `productions/siach_20261023/film_siach.html` (1920x1080, film() with title card + recap + vault). Shot durations are LOCKED to the audio (timeline.json) - never change a shot duration. Check `window.__dur`.

## Look constants (numbers, not adjectives) - same series as siach_noach1
- Warm bright palette: sky top #7EC8F0, sky bottom #FFF1C9, ground warm stone #E9D3A1, accent gold #F5B820, prayer-light gold #FFD54A (glowing small spheres with ink outline #3A2A12), calm blue #3C7FD8, green #5CAA4A. Warm sun upper-left; hemi sky blue / ground warm. Night/evening shots still bright (deep blue #2B3F7A sky with warm lamps), never black.
- THE BOY (hero): the same `boy()` look as siach_noach1, kippa visible, `{scale:.72}`, same look in every shot.
- THE RAV (elder in the apple parable, film part A, and the welcoming father figure in B4): white long beard, long black coat, black hat (hatColor visible against hair), scale .8, same look in A1-A4 and B4.
- THE OLD MAN who prays (C1, C2, C5): grey beard, dark grey coat, kippa #2A4A8A, scale .78.
- Every male figure has a visible kippa or hat (set hatColor #2A4A8A or #E8E0C8 on lite looks). Men and boys only - no women or girls anywhere. No crosses/churches/mosques.
- Prayer lights: small gold glowing spheres (radius .08-.12) with ink outline, rising in soft arcs (pure function of t). The TREASURY: a large closed wooden chest with gold bands floating high in a warm cloud, glow when lights enter it, lid opens in C4/C5.
- BANNED: dark/black skies, empty stage after a caption leaves, figures cut by frame edge, hero smaller than 40% of frame height in his key shot, still 1-second windows (camera always moves), text on props, ritual objects (no sefer Torah, tefillin, tallit, tzitzit as objects), any injury or crash (the car STOPS safely), hard cuts more than 1/3 of seams.

## Characters and gestures (working list only)
rest explain point wide think up offer heart shrug count hips. Everything else is a defect.

## Seams
A1-A4 one orchard courtyard, continuous camera flow; A4->B1 dissolve through warm light; B1-B4 one garden/path world (the warm-lit house stays the anchor); B4->C1 dissolve through the house window light into the shul at dawn; C1->C2 crane up following the lights into the cloud; C2->C3 hard cut allowed (street); C3->C4 same street continuous; C4->C5 dissolve through the gold beam; C5->D1 hard cut allowed (bedroom dawn); D1-D4 continuous morning, ends very wide and rising. Stage ground opaque (no white flash).

### film_siach - morning talk (title "כדי שנהיה בקשר", kicker "שיח הבוקר בבית המדרש · פרשת לך לך תשפ״ז")
- A1 (11.5 s) sunny orchard courtyard with a wooden table under an apple tree; THE RAV sits, THE BOY sits opposite; a bowl of red apples between them; the boy looks at the apples eagerly (gesture point at the bowl), the rav calm (rest). Crane down from the tree top to eye level on both.
  caps: "משל: רבי ותלמידו, וקערת תפוחים על השולחן" / "התלמיד מסתכל על התפוחים, הוא אוהב תפוחים"
- A2 (11.5 s) the boy lifts one apple close to his face (gesture offer, holding), a few gold lights rise from his lips for 1 s and then the light goes DOWN into the apple and the apple glows (his goal = the apple). Slow pushIn on the boy.
  caps: "התלמיד מברך, כדי שיוכל לאכול" / "הברכה באה בשביל התפוח"
- A3 (11.5 s) the rav lifts an apple; this time many gold lights rise from the apple UPWARD in a long column to the sky, the sky above brightens (his goal = the blessing). Gesture up, then heart. Orbit 30 deg around the rav, low angle looking up the column.
  caps: "הרבי אוכל, כדי שיוכל לברך" / "התפוח הוא הדרך אל הברכה"
- A4 (11.4 s) wide: both sit with apples; above the boy a short loop of light circles back down into his apple, above the rav a tall column rises to the sky. The rav turns to the boy (explain), the boy thinks (think). Pull back and rise to a wide of the whole courtyard.
  caps: "אותו מעשה בדיוק, בשני כיוונים הפוכים" / "השאלה היא: בשביל מה?"
- B1 (10 s) bright garden in front of a small warm-lit house (the house = closeness, it glows softly in the window); everything is perfect: flowers, fruit, the boy lies relaxed on a garden bench (rest, hips). Slow dolly along the garden.
  caps: "כשהכול טוב ומסודר" / "נדמה שלא חסר לנו כלום"
- B2 (10 s) the boy strolls away from the house along a long path, not looking back; the house light grows smaller behind him (distance grows, pure function of t). Tracking camera beside him, the house stays visible far behind.
  caps: "בלי לשים לב, מתרחקים" / "ושוכחים לפנות אל ה׳"
- B3 (10 s) a grey rain cloud slides over the boy (soft rain streaks, no lightning), he stops, looks up (gesture think), then turns back toward the far warm house (point). Camera low in front of him, then swings behind to show the house far away.
  caps: "ואז מגיע קושי" / "הוא לא בא משנאה, אלא מאהבה"
- B4 (9.9 s) the boy walks fast back to the house, the cloud thins, sun returns; THE RAV (as a father figure) stands in the doorway and opens his arms (wide), the boy arrives (heart). Camera follows, ends medium on both in the warm doorway light.
  caps: "כדי שנחזור ונהיה בקשר"
- C1 (11.2 s) a simple bright beit knesset at dawn (from shul.js): THE OLD MAN prays at a shtender; time-lapse: window light changes from dawn to noon to dusk and back (cycle twice), and at each cycle 3 gold lights rise from him up through the ceiling. Slow orbit around him.
  caps: "כל תפילה עולה למעלה" / "אף תפילה לא חוזרת ריקם"
- C2 (11.2 s) above the clouds: streams of gold lights from many directions fly into THE TREASURY chest, it glows brighter with each one. Crane up from the shul roof through the cloud to the chest.
  caps: "ה׳ שומר את התפילות באוצר" / "לפעמים במשך שנים רבות"
- C3 (11.2 s) a sunny town street with a crosswalk; THE BOY starts to cross, looking at a book in his hands; a small car (simple rounded box car, light blue) approaches from the side, moving fast. No crash. Camera at kerb level, wide enough to show both.
  caps: "ילד חוצה את הכביש" / "ורכב מתקרב במהירות"
- C4 (11.2 s) the treasury lid opens high above, a beam of gold light comes down and lands between the car and the boy at 2.5 s; the car stops softly one metre before him (ease out), the boy turns, surprised (shrug), safe. Camera tilts from the sky down the beam to the street.
  caps: "ברגע האחרון, הרכב נעצר" / "מה הציל אותו?"
- C5 (11.2 s) back in the beit knesset: THE OLD MAN (older now, whiter beard) prays; the open treasury far above in a soft glow, and a thin gold thread connects his old prayers to the street below (a soft arc of lights). Gesture heart. Slow pushIn on his face.
  caps: "תפילות שהתפללו פעם, על דברים אחרים" / "ה׳ הוציא אותן בדיוק לרגע הזה"
- D1 (9.7 s) a boys' bedroom at sunrise (warm orange window); a round alarm clock (no digits needed, just hands) rings with a small shake; THE BOY gets up at once and stands (up). Camera from the window side, rising.
  caps: "לא לפחד להצליח"
- D2 (9.7 s) morning path to the beit midrash, sun rising; THE BOY walks briskly and arrives at the door first, other boys follow. Side tracking dolly.
  caps: "לקום בזמן, להגיע בזמן"
- D3 (9.7 s) inside the beit midrash: 8 boys pray at shtenders; from each rises a light of a slightly DIFFERENT warm color (gold, amber, rose-gold, light blue-gold...), THE BOY in front, his light clearly his own. Slow orbit around the boy.
  caps: "אין בעולם תפילה כמו שלך"
- D4 (9.7 s) very wide of the whole beit midrash, ceiling fades into sky, all the different lights rise together toward the open treasury high above. Crane up and back, calm end.
  caps: "כי אין עוד אחד כמוך"
- recap: "יש מי שמברך כדי לאכול, ויש מי שאוכל כדי לברך" / "הקושי בא מאהבה, כדי שנהיה בקשר" / "אף תפילה לא הולכת לאיבוד"

## Rules for the builder
Follow the worker rules block in builder_kit.md. Captions only as vault IDs. Do not render video. Report in English, no Hebrew.
