# "A workshop that pulls, not pushes" - a 3D film on the first ODT lesson (brief for the builders)

Source: the first meeting of the ODT course for workshop leaders (instructor Haim Katz, "Gisha Center", 20/10/2026),
as analysed in `C:/team_workspace/haim_katz_lesson_20261020/` (the builders do NOT need to read it - everything is below).
Audience: the course participants (adult men) and Yosef. Shown with music and NO narration: the captions are the whole explanation.
Length: about 7 minutes. Yosef (23/10/2026): "beautiful and creative, an organized script, no narrator, music and captions".

## Engine, rules, quality bar
Exactly as in `C:/projects/_studio-animatzia/productions/toldot06/BRIEF.md` - READ IT FIRST (engine API, people_pro.js, modesty
rules, camera rules, quality bar). Copy the page head from `../azamra342/_head_example.html`. Deterministic scenes (function of t).
Output: `C:/projects/_studio-animatzia/productions/odt_haim1/<film_id>.html`. Verify with `tools/verify_scene.py`. Do NOT render video.
Never Read a .png still - only the JPGs that safe_view.py / verify_scene.py print as CLEAN.

## The world, the characters, the one big visual idea
- THE HALL (shared module `hall.js`, built ONCE by the first builder): a bright activity hall - warm wooden floor, light walls,
  big windows with afternoon sun from the left (warm #ffd9a0 key light), a few stacked chairs and a table at the side.
- THE INSTRUCTOR: an adult man, `{coat:'#2a2f3a', beard:'#4a3424', beardLen:.45, hat:'kippa', hatColor:'#101014', skin:'#eccaa8'}`,
  white shirt visible, calm and smiling. He never pushes anybody - he gestures, invites, points.
- THE GROUP: 8 men (course participants) with kippot, white shirts and dark trousers, varied coat colours from
  ['#2b3a5a','#3a3a40','#4a3a2e','#2e4a3e'], some with short beards. Adult scale 1.0 (NOT the boy scale). Men only.
- THE ARC OF 8 STATIONS (`arc.js`, shared): eight big round floor discs laid out as a gentle rising arc across the hall floor,
  numbered 1..8 in gold (#c9a227) with a short label on each disc (labels are the caption ids S1..S8 of film_b, same text).
  Export `buildArc(Wd)` -> `{ pos(n) -> Vector3 of disc n, light(n, amount) }`. A disc glows softly when "lit".
  This arc is the recurring image of the whole film: the group walks along it, station by station.
- THE PULL ROPE (the metaphor of film_a): a soft glowing golden thread. "Pushing" = the instructor behind a person pushing
  (the person resists, leans back). "Pulling" = a golden thread from something interesting (a lit disc, a ball) gently draws
  the person forward and he walks by himself, smiling.
- Palette: navy #1f2a44, cream #f6efe2, wood #c89a6a, gold #c9a227 only as an accent. Bright, warm, no clutter.

## Films and EXACT captions (word for word, in this order; every caption at least 5 s)

### film_a - opening (title "סדנה שמושכת", kicker "קורס ODT · המפגש הראשון") ~40 s, no recap
- A1 (12 s) the empty hall at golden afternoon; the camera glides in low over the floor, the 8 discs light up one after another.
  caps: "קורס ODT, המפגש הראשון: איך בונים סדנה." / "המנחה: חיים כץ, מרכז גישה."
- A2 (14 s) "pushing": the instructor stands behind a participant and pushes; the participant leans back and stops. A soft grey tint.
  caps: "אפשר לדחוף אנשים קדימה —" / "ואז הם נעצרים, ומתנגדים."
- A3 (14 s) "pulling": the tint becomes warm; a golden thread from a glowing disc; the participant walks forward by himself, smiling,
  and two more follow. The camera circles them.
  caps: "ואפשר להזמין: לבנות דרך בטוחה ומסקרנת," / "שהקבוצה רוצה ללכת בה מעצמה."

### film_b - the 8 stations (title "שמונת השלבים", kicker "חלק א'") ~1:50
- B1 (12 s) high flight over the whole arc, all 8 labels readable. caps: "כל סדנה טובה עוברת בשמונה תחנות." / "לכל תחנה יש תפקיד."
- B2 (12 s) disc 1 lights; the instructor greets the group, they stand in a loose circle around him.
  caps: "1. חיבור: אמון במנחה, היכרות, ולספר מה יקרה היום."
- B3 (11 s) disc 2; the group laughs, shoulders drop. caps: "2. הפשרת קרח: להוריד מתח. עד שבע דקות — ואם לא עובד, עוברים הלאה."
- B4 (11 s) disc 3; quick movement, a ball flies between them. caps: "3. ממלא אנרגיה: להעלות את הקצב."
- B5 (12 s) disc 4; the group tries a task, the instructor steps back and watches. caps: "4. פעילות טרום־מרכזית: לראות מי מוביל, מי משתתף, ואיך הקבוצה עובדת."
- B6 (12 s) disc 5, the biggest disc, brighter; the group works together, focused. caps: "5. הפעילות המרכזית: לב הסדנה, כעשרים דקות."
- B7 (11 s) disc 6; everybody cheers together. caps: "6. משחק סיום: כיף וחיבור — בלי מפסידים."
- B8 (11 s) disc 7; the group sits in a circle, one speaks, others listen. caps: "7. עיבוד: מה קרה כאן, ומה למדנו."
- B9 (11 s) disc 8; everyone raises hands for the closing clap. caps: "8. סגירה: לסיים יחד, ברגע משותף."
- B10 (10 s) the camera rises; the arc glows end to end. caps: "ובכל תחנה — לשאול: מה התפקיד שלה ברצף?"

### film_c - five games (title "משחקים מהשיעור", kicker "חלק ב'") ~2:30
- C1 (16 s) the skipping circle: 8 men in a circle holding hands; a "skip" ripple passes one, then two, then three places around the circle
  (show it with a gold ring hopping along the hands). Disc 2 glows at the side.
  caps: "מעגל הדילוג: מחזיקים ידיים, ומדלגים — אחד, שניים, שלושה, ארבעה." / "כל סבב קצת יותר קשה. מושלם להפשרת קרח."
- C2 (20 s) the helium stick: two teams, each with a long thin light rod (like a tent pole) resting on everybody's index fingers;
  the rod first floats UP, then slowly comes down to the floor together. Disc 4 glows.
  caps: "מקל הליום: כולם תומכים במקל באצבע אחת, וצריכים להוריד אותו יחד לרצפה." / "נשמע קל. בפועל המקל עולה למעלה." /
  "כאן רואים את הקבוצה: מי מוביל, מי שותק, מי משחרר."
- C3 (22 s) the four corners: the group stands in the middle, each must find his number group; first a messy mill (a red "timer" ring),
  then a participant raises his hand and points to the 4 corners labelled 1..4; everybody walks to a corner, done fast (green ring).
  caps: "מתחלקים לקבוצות לפי מספר שכל אחד בחר. בפעם הראשונה — בלגן." / "עצרנו ושאלנו: מה לא עבד?" /
  "משתתף הציע: ארבע פינות לארבעה מספרים. היו ויכוחים — ואז זה עבד מהר."
- C4 (16 s) "why did I choose": the small groups in their corners; one man in each group talks, the others nod; a speech bubble icon (no text).
  caps: "ואז שאלה אחת: למה בחרת דווקא את המספר הזה?" / "משחק חלוקה הפך לשיחה אישית."
- C5 (16 s) the closing clap: everybody raises hands; the instructor claps - all clap; he only pretends - nobody claps, they laugh.
  caps: "מחיאת כף: מוחאים רק כשהמנחה באמת מוחא." / "רגע של צחוק משותף, וסוף ביחד."
- C6 (10 s) the five games float above the arc and each drifts to a DIFFERENT disc and then to a second disc.
  caps: "וכל משחק כזה יכול לשמש בכמה תחנות שונות."

### film_d - how to lead a game (title "איך מנחים משחק", kicker "חלק ג'") ~1:40
- D1 (14 s) a big slowly turning wheel standing on the floor with 4 segments (icons only: play, magnifier, lightbulb, repeat arrow);
  the group walks around it. caps: "כל משחק עובר מחזור: משחקים, בודקים, לומדים —" / "ומנסים שוב."
- D2 (12 s) the instructor holds up 3 cards (icons: name tag, target, list). caps: "מציגים משחק בשלושה דברים: שם, מטרה, ותוכן."
- D3 (12 s) the instructor between two stations, opening his hand like an invitation; the group leans forward curious.
  caps: "מעבר בין משחקים — כמו הזמנה, לא כמו פקודה." / "\"מי רוצה לראות אם נצליח גם עם עיניים עצומות?\""
- D4 (12 s) a small hourglass at disc 2 runs out; the instructor smiles and moves on. caps: "משהו לא עובד? לא נאבקים. עוברים הלאה."
- D5 (12 s) a 1-on-1 game: the one who lost stands behind the winner and cheers him; the group grows into a cheering crowd.
  caps: "גם מי שהפסיד נשאר בפנים: הוא הופך למעודד."
- D6 (12 s) one game card with three discs lighting in turn (2, 3, 6). caps: "משחק אחד, כמה תחנות: התפקיד נקבע לפי הזמן ולפי מה שבא אחריו."

### film_e - the task (title "עד המפגש הבא", kicker "חלק ד'") ~45 s
- E1 (15 s) the group leaves the hall at sunset; each man carries one glowing small object (a ball, a rod, a card).
  caps: "המשימה של חיים: לנסות לפחות דבר אחד מכל מה שעשינו —" / "ולהרגיש את היכולת שלנו מול קבוצה."
- E2 (14 s) wide view of a field at a farm at dusk; a sign-shaped silhouette, no text. caps: "המפגש הבא: בחוות שמשון. ODT בשטח."
- recap: "סדנה טובה מושכת, לא דוחפת." / "שמונה תחנות, ולכל אחת תפקיד." / "משחקים, בודקים, לומדים — ומנסים שוב."

### film_z - credits (title "סדנה שמושכת", no kicker, no recap) 10 s

## Assembly (supervisor's job)
Remote render per film, concat a..z, music bed (calm, warm; from the studio music library), loudnorm -16.

## BANNED (grows after each review)
- Women or girls; crosses or any religious symbol other than a kippa.
- Hebrew typed directly in the html (caption ids only).
- Close shots straight from behind (hair reads as long); prefer 3/4 or front.
- Any text on screen that is not an approved caption id or a disc number.
