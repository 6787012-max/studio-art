# BRIEF - film_siach: morning talk 25/10/2026 (Mechina Beit HaTalmud) - a 3D film for the builders

Source: the real morning talk in the beit midrash (recorded audio). The REAL VOICE of the speaker plays under the whole film (5 clips, 230.43 s in total, kept in the day folder, mixed locally later - do NOT add any audio to the page). The picture must act out what is said; captions summarise it (Hebrew, ids only for builders).
Audience: Haredi boys, mechina age 13-17. Shown with the real talk audio + soft music.
Central idea, two parts. (1) Words between friends: some boys casually remark on another boy's clothes, looks, speech, even his parents. From now on whoever hurts a friend like that leaves the beit midrash for a week, and "it was by mistake" does not help - like someone who drives into a forbidden zone by mistake still gets a fine. The goal: a calm, pleasant beit midrash where everyone feels good. (2) "Choosing to grow" (this week's elections activity): every boy gets two envelopes - a GOLD one ("my light": 3 notes with good traits he already has) and a GREEN one ("my growth": 3 notes with traits he wants to grow in). Voting is fully secret - no name on the envelope, nobody knows what you chose. At the end the notes are counted, each colour separately. Two goals: a shared social experience with the feeling of real choice, and above all learning to recognise your good sides and where you want to grow.
DO NOT SHOW any mocking, insults, hitting or bad speech acted out (rule of this activity). Hurt is shown only symbolically (grey stones of words, a dimmed glow), never as a scene of boys mocking.
Engine, rules, quality bar: exactly `C:/Users/<user>/.claude/skills/video-production/references/builder_kit.md` and reference productions `productions/siach_20261026/film_siach.html` + `world26.js` + `sh26.js` + `shared.js` + `kit.js` (LATEST of the SAME SERIES, same look - COPY its boy look, man looks, palette, interiors, car), and `productions/siach_20261021/shul.js` (the beit midrash interior: tables, benches, bima, bookshelves).
Output: ONE page `productions/siach_20261025/film_siach.html` (1920x1080, film() with title card + recap + vault). Shot durations are LOCKED to the audio (timeline.json) - never change a shot duration. Check `window.__dur`. The title card overlays the first 4.2 s of A1 (no leading silence).

## Look constants (numbers, not adjectives) - same series as siach_20261026
- Palette: sunny sky top #7EC8F0, bottom #FFF1C9; beit midrash interior bright, walls #F4EEE2, wood tables #B98A5A, benches #6F8F5A (green like the real room); warm interior glow #FFD9A0 (only lamps/windows); accent gold #F5B820, kindness-glow gold #FFD54A, growth green #5CAA4A, calm blue #3C7FD8; "hurt" grey #8A9099 (stones of words, never black). Key light near-neutral (white shirts must stay white - failure log 24/10).
- THE BOY (hero, all parts): series boy() look `{scale:.72}`, white shirt, dark trousers, kippa clearly visible (hatColor #2A4A8A).
- THE LONELY BOY (A2-B4): second boy() look scale .72, different hair tone, kippa visible (hatColor #E8E0C8 or #2A4A8A).
- OTHER BOYS: crowd of boys (lite figures), every one with a visible kippa (hatColor rule). THE TEACHER at the bima: man, short dark beard, black jacket, white shirt, black hat with visible hatColor, scale .8; only in wide shots (A1, B5).
- THE DRIVER (B2): man look of siach_20261026 driver; THE CAR: the same bright white-silver car of siach_20261026, no logos, blank plate.
- ENVELOPES: GOLD envelope #F5B820, GREEN envelope #5CAA4A, plain, no letters. NOTES: small plain paper cards #FFF8E6 each with one simple coloured icon shape (star, heart, clock, book, hand, sprout) - NO letters, NO numbers on anything.
- Every male figure has a visible kippa or hat. Men and boys only. No crosses/churches/mosques. No ritual objects as props.
- BANNED: dark skies or dark rooms, empty stage after a caption leaves, figures cut by frame edge, hero smaller than 40% of frame height in his key shot, still 1-second windows (camera always moves), text/letters/numbers on any prop, sign, screen, plate, envelope or note, hard cuts more than 1/3 of seams, a crane that starts inside a mesh (blank first frame), any figure that looks shirtless, any acted-out mocking or violence.

## Characters and gestures (working list only)
rest explain point wide think up offer heart shrug count hips. Everything else is a defect.

## Seams
A1-A2 one beit midrash; A2->B1 dissolve into the sunny courtyard outside the beit midrash; B1 courtyard; B1->B2 dissolve into a street (car); B2->B3 dissolve to a bright kitchen table; B3->B4 dissolve back into the beit midrash; B4-B5 beit midrash; B5->C1 continuous: camera comes down to one table in the same beit midrash; C1-C5 that table area; C5->D1 continuous within the beit midrash corner with a simple voting booth (plain wooden screen) and a plain wooden ballot box; D1-D4 same; D4->E1 dissolve; E1-E3 beit midrash; E4 ends wide, rising out of the beit midrash roof (start above the roof, never inside a mesh) to a sunny view. Stage ground opaque (no white flash).

### film_siach - morning talk (title "מילה שפוגעת, פתק שבונה", kicker "שיח הבוקר בבית המדרש · פרשת וירא תשפ״ז")
- A1 (12.92 s) wide: bright beit midrash in the morning, boys sit at the green benches and wooden tables, THE TEACHER stands at the bima talking (explain). Slow crane down from high in the room toward the boys.
  caps: "שיח הבוקר בבית המדרש" / "על הדרך שבה אנחנו מדברים זה עם זה"
- A2 (12.91 s) medium: THE LONELY BOY sits at the end of a bench; small grey stones (#8A9099, rounded, no faces) drift slowly through the air toward him from off-frame and settle around him on the bench; the warm glow around him dims (pure function of t); he lowers his head (think). Nobody is shown throwing or speaking. Slow pushIn.
  caps: "הערה על הבגד, על המראה, על הדיבור" / "נאמרת בקלות - ונשארת בלב"
- B1 (11.55 s) sunny courtyard outside the beit midrash: a closed beit midrash door, a calendar-like row of 7 plain empty squares on a stand fills one by one with grey (pure function of t, no letters); THE BOY stands outside looking at the door (think, then hips). Slow orbit.
  caps: "מי שפוגע בחבר" / "יוצא מבית המדרש לשבוע"
- B2 (11.55 s) a street: THE DRIVER's car rolls past a plain no-entry sign (red circle with a white bar, no letters) into a closed lane; a small plain paper ticket flutters down onto the windshield; the driver lifts his hands (shrug). Tracking camera beside the car.
  caps: "גם 'בטעות' לא עוזר" / "מי שנכנס בטעות - מקבל קנס"
- B3 (11.55 s) bright kitchen table: a glass cup slides slowly off the edge (no hand pushing it) and breaks into pieces on the floor, slow-motion; THE BOY looks at it (think). Camera low, slow pushIn on the pieces.
  caps: "הטעות לא מבטלת את הפגיעה" / "מה שנשבר - נשבר"
- B4 (11.55 s) beit midrash: THE BOY notices THE LONELY BOY, walks over, sits beside him and offers him an open book (offer); the grey stones fade away and the warm kindness-glow gold rises around both (heart). Slow orbit around the two.
  caps: "במקום הערה - מילה טובה" / "וחבר שמרגיש שייך"
- B5 (11.56 s) wide calm beit midrash, all boys learning, soft gold glow in the windows, THE TEACHER at the bima (rest). Camera rises slowly, then starts coming down toward one table (leads into C1).
  caps: "בית מדרש שקט ורגוע יותר" / "שכל אחד מרגיש בו טוב"
- C1 (10.72 s) crane down onto one wooden table: twenty plain note cards laid out in 4 rows of 5, each with one simple icon shape; they appear one after another (pure function of t). No letters or numbers.
  caps: "בוחרים לצמוח" / "עשרים מידות טובות על השולחן"
- C2 (10.72 s) THE BOY sits at the table and lifts two envelopes - one GOLD, one GREEN - one in each hand (up, then count). Slow pushIn, medium.
  caps: "שתי מעטפות לכל תלמיד" / "צהובה וירוקה"
- C3 (10.72 s) close on the GOLD envelope: three note cards rise from the table one by one and glide into it, each leaving a soft gold sparkle trail; the envelope glows gold. THE BOY smiles (heart). Slow orbit.
  caps: "במעטפה הצהובה - האור שלי" / "שלוש מידות שאני כבר טוב בהן"
- C4 (10.72 s) close on the GREEN envelope: three note cards glide into it, then a small green sprout grows out of the envelope's top (pure function of t). THE BOY (think, then up). Slow pushIn.
  caps: "במעטפה הירוקה - הצמיחה שלי" / "שלוש מידות שאני רוצה לגדול בהן"
- C5 (10.73 s) example: a big plain round wall clock (hands only, no numerals) above the beit midrash door; THE BOY walks in through the door on time as the hand reaches the top; he holds up one note card with a clock icon and looks from the gold envelope to the green one (think). Camera dolly following him.
  caps: "למשל: לבוא בזמן" / "אני כבר טוב בזה - או רוצה להשתפר?"
- D1 (11.12 s) corner of the beit midrash: a simple wooden voting screen (plain, three panels) and a plain wooden ballot box with a slot; THE BOY steps behind the screen alone and drops both envelopes into the box. Camera slow orbit from the side (we see him, the screen hides his hands from the room).
  caps: "ההצבעה חשאית לגמרי" / "אין שם על המעטפה"
- D2 (11.12 s) the other boys in the room keep learning with their backs to the corner, nobody looks; THE BOY walks back to his seat calm (rest). Camera wide, slow track.
  caps: "אף אחד לא יודע מה בחרת" / "זה רק בינך לבין עצמך"
- D3 (11.12 s) the ballot box is open on the big table; note cards fly out and land in two separate areas - gold cards on the right, green cards on the left - forming small stacks that grow (pure function of t). Boys stand around the table watching (wide, count). Slow crane down.
  caps: "בסוף סופרים את הפתקים" / "בכל צבע לחוד"
- D4 (11.11 s) close: one gold stack and one green stack rise taller than the rest and glow softly; the boys around nod (heart). Slow pushIn.
  caps: "ומתברר מה הקבוצה מעריכה" / "ומה היא רוצה לבנות"
- E1 (12.19 s) the boys together around tables, lively and friendly, small gold and green sparkles float above the group (pure function of t) (wide, explain). Slow orbit.
  caps: "המטרה הראשונה" / "חוויה משותפת ותחושה של בחירה"
- E2 (12.19 s) THE BOY alone at the table, a soft gold light grows in front of his chest like a small sun (no halo on the head); he looks at it (heart). Slow pushIn, medium.
  caps: "המטרה השנייה" / "לזהות את הטוב שבך"
- E3 (12.19 s) beside THE BOY a green sprout grows from a small pot into a young tree with leaves (pure function of t); he stands and looks up at it (up). Camera rises with the tree.
  caps: "ולמצוא איפה אתה רוצה לצמוח" / "ולהתקדם בזה באמת"
- E4 (12.19 s) camera starts ABOVE the beit midrash roof (never inside a mesh) and rises to a very wide sunny view; gold and green glows appear in many windows of the building (pure function of t). Calm end.
  caps: "כל אחד עם האור שלו" / "וכל אחד עם הצמיחה שלו"
- recap: "מילה פוגעת לא נאמרת 'בטעות'" / "האור שלי - מה שאני כבר טוב בו" / "הצמיחה שלי - לאן אני רוצה לגדול"

## Rules for the builder
Follow the worker rules block in builder_kit.md. Captions only as vault IDs. Do not render video. Report in English, no Hebrew. Do not spawn sub-agents unless essential, and then one cheap, well-defined one.
