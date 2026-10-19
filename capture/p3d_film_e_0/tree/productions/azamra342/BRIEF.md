# "Vten tal umatar - I forgot, what now?" - a 3D film (brief for the builders)

Source: the halacha sheet "Azamra Lishmecha" no. 342 (parashat Noach 5787). PDF and its clean text:
`C:/projects/azamra-lishmecha/lessons/342/` (the text was checked with filter_check: clean).
Audience: Haredi boys aged 12. Shown with music and NO narration: the captions are the whole explanation.
Yosef (19/10/2026): "3D only, with captions, a real film - not just captions. Like the new 3D lessons of Eretz Yisrael.
Economical, but do not compromise on quality."

## Engine, rules, quality bar
Exactly as in `C:/projects/_studio-animatzia/productions/toldot06/BRIEF.md` - READ IT FIRST (engine API, characters,
modesty rules, camera rules, quality bar, how to make stills). Copy the page head from `_head_example.html` in this folder.
Reuse freely from the lesson-06 films in `../toldot06/` - especially the beit knesset interior in `film_e.html`
(benches, aron, shtenders, bookshelves, window) and the rain/clouds/fields in `film_b.html` .. `film_f.html`.
Output files go in THIS folder: `C:/projects/_studio-animatzia/productions/azamra342/<film_id>.html`.
Stills: `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/azamra342/<film_id>.html productions/azamra342/_stills/<film_id> --times ... --sheet productions/azamra342/_stills/<film_id>/sheet.png --cols 4 --timeout 600`
Do NOT render video. Work economically: read each engine file once, do not print long outputs, keep iterations focused.

## The main character and the one big visual idea
- THE BOY: a student (look from the toldot06 brief, `{scale:.72}`), siddur in hand. He is the hero of every film.
- THE PRAYER ROAD (`road.js`, shared by all films - built ONCE by the first builder, then imported by everyone):
  the Shemoneh Esrei as a road of big warm stone slabs running forward (+z) through a green valley, with an arch/gate
  for every station and a Hebrew `label` on it. The boy walks along it. Order of stations along the road:
  1. "תחילת התפילה" (start gate)
  2. a few small unlabeled arches (the first brachot)
  3. "ברך עלינו" - a LONG segment (wheat fields and clouds beside it) with two floor markers inside it:
     a blue marker "ותן טל ומטר" in its middle, and a gold marker "ברוך אתה ה'" at its end
  4. "תקע" gate
  5. five small unlabeled arches (the middle brachot)
  6. "שמע קולנו" - a segment with a marker "כי אתה שומע" and a gold marker "ברוך אתה ה'" at its end
  7. "רצה" gate, 8. "מודים" gate, 9. "שים שלום" gate, 10. "יהיו לרצון" gate (the last one), 11. "עושה שלום" + three footprints back.
  Export from road.js: `buildRoad(Wd, opts)` -> `{ z(name) -> z position of a station/marker, group, highlight(name, amount) }`,
  plus `arrow(Wd, fromVec3, toVec3, {color, amount:t=>0..1})` (a glowing golden arc that grows from the boy to the target)
  and `drop(Wd, pos, t0)` = THE SIGNAL "he remembered!": a big blue raindrop falls from the sky and splashes beside him (same in every film).
  Sefard film needs a variant: at the "ברך עלינו" station two parallel lanes, a summer lane "ברכנו" (sun) and a winter lane "ברך עלינו" (cloud).
- Every case = the boy stands at the right place on the road, the drop falls, the arrow shows where he goes, and he walks there.
  The camera flies along the road, rises above it to show the jump back, circles the boy at the moment he remembers.
- Warm, bright daylight (except the night scenes listed below). Labels only for station names and short words like "ז' חשון".

## Films and EXACT captions (use them word for word, in this order; every caption at least 5 s)
Each film: `title` = the corner tag, `kicker` = the opening card, `recap` = the 3 "מה למדנו?" lines.

### film_a - opening (title "ותן טל ומטר", kicker "אזמרה לשמך · גיליון 342") ~36 s, no recap
- A1 (11 s) end of summer: a dry, cracked field and a village with a beit knesset; low flight over the field.
  caps: "סוף הקיץ. האדמה יבשה, והשדות מחכים לגשם." / "מליל ז' חשון מבקשים בארץ ישראל: ותן טל ומטר."
- A2 (12 s) inside the beit knesset (from film_e): the boy prays at a shtender, a label "ז' חשון"; slow orbit around him.
  caps: "בברכת השנים אומרים: \"ותן טל ומטר לברכה על פני האדמה\"." / "אבל כל הקיץ אמרנו \"ותן ברכה\" — והלשון רגילה."
- A3 (12 s) the boy stops, "think" gesture; the camera rises and reveals the prayer road stretching ahead of him.
  caps: "מה עושה מי ששכח?" / "הכול תלוי איפה נזכר. בואו נלך בדרך של התפילה."

### film_b - Ashkenaz (title "בני אשכנז", kicker "חלק א'") ~2:10
- B1 (12 s) flight over the whole road, labels readable. caps: "זו הדרך של התפילה: כל ברכה היא תחנה." / "נעקוב אחרי הילד, ונראה מה עושים בכל מקום."
- B2 (14 s) boy in the middle of "ברך עלינו", before the gold marker; drop; arrow back to the blue marker; he steps back.
  caps: "נזכר באמצע \"ברך עלינו\", לפני \"ברוך אתה ה'\" שבסופה?" / "חוזר ל\"ותן טל ומטר\", וממשיך משם כסדר."
- B3 (16 s) boy just past the gold marker of "ברך עלינו"; drop; long arrow FORWARD to "שמע קולנו"; he walks on.
  caps: "כבר אמר \"ברוך אתה ה'\" בסוף הברכה?" / "ממשיך בתפילה כרגיל," / "ואומר \"ותן טל ומטר\" ב\"שמע קולנו\", לפני \"כי אתה שומע\"."
- B4 (10 s) a small extra glowing slab appears between "ברך עלינו" and "תקע".
  caps: "פוחד שישכח שוב עד \"שמע קולנו\"?" / "אפשר לומר מיד — בין \"ברך עלינו\" ל\"תקע\"."
- B5 (16 s) boy at the gold marker at the end of "שמע קולנו"; a scroll with "למדני חוקיך" floats up.
  caps: "נזכר בסוף \"שמע קולנו\", אחרי \"ברוך אתה ה'\"?" / "אומר \"למדני חוקיך\" — וזה פסוק בתהילים." / "ואז \"ותן טל ומטר... כי אתה שומע\", וממשיך."
- B6 (11 s) boy between "שמע קולנו" and "רצה". caps: "סיים \"שומע תפילה\", ועוד לא התחיל \"רצה\"?" / "אומר שם \"ותן טל ומטר\", וממשיך \"רצה\"."
- B7 (14 s) boy at "רצה"/"מודים"; dramatic rise of the camera; big arrow back to the START of "ברך עלינו".
  caps: "כבר התחיל \"רצה\", או שהוא כבר ב\"מודים\"?" / "חוזר לתחילת \"ברך עלינו\", וממשיך משם כסדר."
- B8 (10 s) camera glides on to the "יהיו לרצון" gate. caps: "וכך עד \"יהיו לרצון\" האחרון —" / "זה שבסוף \"אלוקי נצור\", לפני \"עושה שלום\"."
- B9 (12 s) boy at the end of the road, before the footprints; huge arrow back to "תחילת התפילה".
  caps: "סיים \"יהיו לרצון\" ואת הבקשות, ועוד לא פסע לאחור?" / "חוזר לתחילת התפילה."
- recap: "לפני \"ברוך אתה ה'\" — חוזרים ל\"ותן טל ומטר\"." / "אחרי — אומרים ב\"שמע קולנו\"." / "התחיל \"רצה\" — חוזר ל\"ברך עלינו\". סיים — לראש."

### film_c - Sefard (title "בני ספרד", kicker "חלק ב'") ~1:20
- C1 (12 s) the two lanes at the station. caps: "בנוסח ספרד, ברכת החורף שונה מברכת הקיץ." / "בקיץ: \"ברכנו\". בחורף: \"ברך עלינו\"."
- C2 (12 s) boy at the start of the summer lane; drop; he crosses to the winter lane and continues.
  caps: "נזכר אחרי \"ברכנו ה' אלוקינו בכל מעשי ידינו\"?" / "ממשיך \"את השנה הזאת...\" — בנוסח של החורף."
- C3 (10 s) middle of the winter lane, before its gold marker; arrow back to the blue marker.
  caps: "נזכר באמצע הברכה, לפני \"ברוך אתה ה'\"?" / "חוזר ל\"ותן טל ומטר\", וגומר כסדר."
- C4 (20 s) just past the gold marker, before "תקע": first an arrow forward to "שמע קולנו", then a glow right where he stands.
  caps: "אמר כבר \"ברוך אתה ה'\", ועוד לא התחיל \"תקע\"?" / "לדעת המשנה ברורה — אומר ב\"שמע קולנו\"." / "ורבים מבני ספרד נוהגים לומר מיד שם," / "וטוב לומר שוב גם ב\"שמע קולנו\"."
- C5 (11 s) boy already inside "תקע"; arrow to "שמע קולנו". caps: "כבר התחיל \"תקע\"? אומר ב\"שמע קולנו\"." / "ומשם והלאה — כמו בני אשכנז."
- recap: "בקיץ \"ברכנו\", ובחורף \"ברך עלינו\"." / "באמצע הברכה — חוזרים ל\"ותן טל ומטר\"." / "אחרי סוף הברכה — רבים אומרים מיד שם."

### film_d - questions (title "שאלות ותשובות", kicker "חלק ג'") ~1:55
- D1 (15 s) on the road: he says it mid-segment (a blue label pops up where he is), and continues.
  caps: "בני אשכנז: אמר \"ותן טל ומטר\" במקום שנזכר, והמשיך משם?" / "יצא. אבל אומרים אותו בסוף משפט — לא באמצע משפט." / "ומסיימים במילים \"וברך שנתנו כשנים הטובות\"."
- D2 (11 s) the arrow should land on "ברך עלינו" but he lands on "שמע קולנו" by mistake.
  caps: "היה צריך לחזור ל\"ברך עלינו\", וחזר בטעות ל\"שמע קולנו\"?" / "נראה שיצא ידי חובה."
- D3 (20 s) outdoors: the sun climbs to the top of the sky (chatzot), a big sundial; then afternoon, the boy goes into the beit knesset.
  caps: "שכח בשחרית וסיים — ועבר זמן התפילה?" / "אם עוד לא חצות היום — מתפלל שוב מיד." / "ואם כבר עבר חצות — מתפלל במנחה פעמיים:" / "פעם למנחה, ופעם להשלמת שחרית."
- D4 (11 s) sunset turning to night over the beit knesset. caps: "שכח במנחה ועבר זמנה? מתפלל ערבית פעמיים." / "וגם אשה שטעתה במנחה — מתפללת ערבית פעמיים." (no women on screen)
- D5 (10 s) night, label "ז' חשון", first rain clouds. caps: "שכח כבר בפעם הראשונה, בליל ז' חשון?" / "גם אז חוזר. יש אומרים: בתנאי של נדבה."
- D6 (10 s) the chazan at the amud; the boy prays by himself at his place. caps: "כשחוזר להתפלל — עדיף שיתפלל בעצמו," / "ולא יסמוך על חזרת הש\"ץ."
- D7 (11 s) motzaei Shabbat: night sky with three stars over the village. caps: "שכח במעריב של מוצאי שבת, וחוזר להתפלל?" / "לא אומר שוב \"אתה חוננתנו\" — כבר אמר אותו."
- D8 (11 s) Shabbat in the beit knesset (white tablecloth, Shabbat feeling). caps: "בשבת התחיל בטעות תפילת חול, ושכח \"ותן טל ומטר\"?" / "לא צריך לתקן — ממשיך בתפילת שבת."
- recap: "עבר זמן התפילה? מתפללים פעמיים בתפילה הבאה." / "חוזרים להתפלל — בעצמנו, לא מהש\"ץ." / "בשבת — ממשיכים בתפילת שבת."

### film_e - doubt and the advice (title "לא בטוח אם אמר?", kicker "חלק ד'") ~2:05
- E1 (12 s) 30 calendar pages fly around the boy, question marks. caps: "בשלושים הימים הראשונים — לא בטוח אם אמר?" / "שני דברים קובעים: האם התכוון לומר, ומתי התעורר הספק."
- E2 (12 s) a thought bubble with a drop (he planned), a clock jumps forward, then a green check. caps: "התכוון לומר, והספק התעורר רק אחרי זמן רב?" / "לא חוזר."
- E3 (12 s) no plan, doubt right after the prayer, arrow back to the start of the road. caps: "לא חשב על זה בכלל, והספק התעורר מיד אחרי התפילה?" / "חוזר לתחילת התפילה."
- E4 (14 s) he prays again (a gentle golden glow = nedava); then Shabbat candles and he does not repeat.
  caps: "ובשני המקרים האחרים — מתפלל שוב בתנאי של נדבה." / "ובשבת אין תפילת נדבה — ולכן לא חוזר."
- E5 (10 s) a big balance scale, level, then tipping. caps: "כל זה כשהספק שקול." / "נראה לו יותר שאמר? לא חוזר."
- E6 (18 s) THE ADVICE: a big floating counter running 1 -> 90 while 30 calendar pages x 3 prayers stack up.
  caps: "העצה: לומר 90 פעמים את המילים —" / "\"ואת כל מיני תבואתה לטובה, ותן טל ומטר לברכה על פני האדמה\"." / "זה כמו 90 תפילות: 30 יום, שלוש תפילות ביום."
- E7 (12 s) caps: "ואז, אם יסתפק — לא חוזר." / "בני ספרד אומרים 90 פעמים: \"רופא חולי עמו ישראל, ברך עלינו\"."
- E8 (10 s) Shabbat candles. caps: "מותר לומר את 90 הפעמים גם בשבת." / "זו הכנה לתפילה, ותועלתה מיד."
- E9 (12 s) the boy in the beit knesset, rain starts outside the window, the fields turn green.
  caps: "ולסיום: גם מי ששכח — תפילתו נחשבת תפילה," / "רק חסרה בה ההזכרה. שנזכה לגשמי ברכה!"
- recap: "לא בטוח? תלוי בכוונה ובזמן." / "90 פעמים — ואז מסתפק לא חוזר." / "ותן טל ומטר לברכה על פני האדמה!"

### film_z - credits (title "ותן טל ומטר", no kicker, no recap) 10 s
- Z1 (10 s) gentle rain over green fields, slow rise. caps: "על פי הגיליון \"אזמרה לשמך\" מס' 342, פרשת נח תשפ\"ז." / "הלכה למעשה — שואלים רב."

## Assembly (not the builders' job)
Remote render per film (`render_parts.py <film_id> <seconds>`), then concat a..z, then music:
`C:/projects/azamra-lishmecha/lessons/342/music/tal_main.mp3` (first half) and `tal_warm.mp3` (second half), loudnorm -16.

## STATUS 19/10 13:00 and two hard rules (read this before anything else)
1. 🔴 NETFREE AND IMAGES: the first builder died on "API Error: 418" right after Reading a PNG still.
   Probing showed that NetFree blocks some full-size PNG frames, while the same frames as JPG pass.
   **Never Read a .png still.** After every stills run:
   `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/safe_view.py productions/azamra342/_stills/<film_id> --out productions/azamra342/_view/<film_id> --sheet 4`
   and Read ONLY files that it printed as CLEAN (the JPGs in `_view/<film_id>/`, including `sheet.jpg`). Never Read anything in `_stills/`.
2. SHARED MODULES ALREADY EXIST - import them, do not rebuild them:
   - `road.js`: `roadWorld`, `buildRoad(Wd,{sefard})`, `arrow`, `drop`, `pop`, `BOY`, `boy(Wd, fn, o)`, `route`, `cine`, `mkShot(dur, caps, build)`, `ct`.
   - `shul.js`: `buildShul(Wd,o)` (beit knesset interior), `buildVillage`, `buildDryland`.
   - Working examples of using them: `film_a.html` and `film_b.html` (built, stills look good overall).
   - Only the "fix" builder may edit road.js / shul.js. Other builders: if you need something extra, write it inside your own film file.
3. Fixes already decided for film_a / film_b / shul.js (fix builder only):
   - The parochet on the aron in shul.js has a spiky sun with an eye-like ring and five bars - REMOVE that design.
     Replace with a gold crown (keter Torah) above two small tablets (luchot) with rounded tops. No other symbols at all.
   - film_a shot A3 (~25 s): the camera is right behind the boy's back, his head is cut off. Re-frame: a 3/4 side view at about 2.5 m,
     the "think" gesture and his face visible, then the rise that reveals the road.
   - Station labels on the arches are too small in the wide shots - make them about 1.6x bigger (in road.js), keep them clear of the caption bar.
   - Avoid close shots of the boy straight from behind (his hair reads as long from the back). Prefer side / 3/4 / front views.
