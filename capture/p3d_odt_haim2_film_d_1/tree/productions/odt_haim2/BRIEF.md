# "A workshop that pulls" v2 - the first ODT lesson AS IT HAPPENED (brief for the builders)

Source: the first meeting of the ODT course for workshop leaders (instructor Haim Katz, "Gisha Center", 20/10/2026).
Audience: the course participants (adult men) and Yosef. Music, NO narration: the captions are the whole explanation.
Length: about 7.5 minutes.

## WHY v2 EXISTS (read this first)
v1 (`../odt_haim1`) was REJECTED by Yosef as "bad and not accurate". Its faults, which v2 must NOT repeat:
- It was built on invented metaphors (a golden "pull thread", glowing station discs on the floor, a wheel of icons,
  an hourglass, lanterns at night). NONE of that happened in the lesson. v2 has NO metaphors and NO symbolic props.
- It showed only 5 of the games. v2 shows every game that was played, in the order it was played.
- It staged games wrongly (the helium stick with men SITTING; it must be STANDING).
- 8 participants read as a tiny class; the real group was about 24.
THE RULE OF v2: every shot is a literal reconstruction of something that really happened in the hall. If a game is
described in this brief, stage EXACTLY its mechanics so a viewer who was there recognises it. Add nothing that is not here.

## Engine, rules, quality bar
Exactly as in `C:/projects/_studio-animatzia/productions/toldot06/BRIEF.md` - READ IT (engine API, people_pro.js, modesty,
camera rules, quality bar). Copy the page head from `../azamra342/_head_example.html`. Deterministic scenes (function of t).
Output: `C:/projects/_studio-animatzia/productions/odt_haim2/<film_id>.html`. Verify with `tools/verify_scene.py`. Do NOT render video.
Never Read a .png still - only the JPGs that verify_scene.py prints as CLEAN.

## The world and the characters (same in every film)
- THE HALL: reuse `../odt_haim1/hall.js` (copy it into this folder as `hall.js`, then improve if needed): warm wooden floor,
  light walls, big windows. KEY LIGHT NEAR-NEUTRAL (#fff1dc, intensity as in hall.js or lower) - a strong orange light turns
  white shirts skin-coloured. Colour only through the windows. A few stacked chairs and a table at the side. NO floor discs,
  NO numbers on the floor except where a shot below asks for them (film_d D7 corner signs).
- THE INSTRUCTOR (Haim): adult man `{coat:'#2a2f3a', beard:'#4a3424', beardLen:.45, hat:'kippa', hatColor:'#2A4A8A', skin:'#eccaa8'}`,
  white shirt visible, calm, smiling, gestures openly (explain, point, invite). He never pushes anyone.
- THE GROUP: 16 adult men (scale 1.0), kippot with a VISIBLE hatColor (#2A4A8A or #E8E0C8 - never near-black), white shirts,
  dark trousers, coats from ['#2b3a5a','#3a3a40','#4a3a2e','#2e4a3e'], about half with short beards. At least 10 full figures
  near the camera; the rest may be lite figures. Each man wears a small white NAME TAG on the left chest (a plain white
  rectangle, NO text). Men only.
- PROPS (only these exist in the whole film): a thin light grey rod 2.2 m long like a folding tent pole (x2, helium stick);
  a soft yellow rubber chicken (throw game); coloured A5 paper sheets (molecules: red, blue, green, yellow); 4 plain white
  A4 sheets on the 4 walls/corners with a big digit 1..4 (film_d D7 only - digits are allowed); a stopwatch in Haim's hand
  (film_d D6). Nothing else - no glowing objects, no icons, no floating cards.
- Palette: navy #1f2a44, cream #f6efe2, wood #c89a6a, gold #c9a227 only as an accent in titles. Bright, warm, uncluttered.
- Camera: every shot moves (slow dolly/orbit/crane), 3/4 or front views of faces, never close from behind. Each shot opens
  on a readable action inside 3 s. Start frames must never be inside a wall/roof (check the first frame).

## Films and EXACT captions (word for word, in this order)

### film_a - opening (title "סדנה שמושכת", kicker "קורס ODT · המפגש הראשון") ~42 s, no recap
- A1 (13 s) the hall; the 16 men arrive and stand in loose small clusters; each has a name tag; Haim stands in front by the table and greets them with an open hand. Camera glides in low from the door.
  caps: "קורס מנחי סדנאות ODT — המפגש הראשון, 20/10." / "המנחה: חיים כץ, מרכז גישה. בחדר כעשרים וארבעה משתתפים."
- A2 (14 s) everybody stands in one big circle; the men look a little stiff (arms crossed, small steps). The turn goes around: one man at a time takes a small step in and raises a hand while talking; the camera follows the turn around the circle (3 speakers).
  caps: "בהתחלה כולם קצת מהוססים." / "חיים פותח בסבב קצר: כל אחד אומר כמה מילים על עצמו."
- A3 (14 s) Haim in the centre of the circle, slow orbit around him; he opens both hands toward the group, they lean in and nod.
  caps: "העיקרון של כל הקורס: סדנה מושכת, לא סדנה דוחפת." / "המשתתפים מביאים את הפתרון, לא המנחה."

### film_b - the first games (title "המשחקים הראשונים", kicker "חלק א'") ~2:40
- B1 (13 s) LINE-UP: the whole group shuffles from a clump into one straight line across the hall, people swapping places; Haim points to one end of the line. Crane rises to see the whole line.
  caps: "להסתדר בשורה: מי שגר הכי קרוב למקום — ראשון." / "הרחוק ביותר — אחרון. בשיעור הוא הגיע מצפת."
- B2 (13 s) the line breaks and re-forms in a different order twice (two quick reshuffles, people stepping past each other). Side dolly along the line.
  caps: "ושוב: לפי מספר האותיות בשם המשפחה." / "ושוב: לפי תאריך הלידה העברי, מא׳ בתשרי עד כ״ט באלול."
- B3 (19 s) LOCATION WHEEL: six small circles of 2-3 men each, arranged in a ring around the hall. Haim in the middle asks (raises a finger); in EVERY small circle exactly one man walks to the NEXT small circle (all clockwise at the same time), then again with another man. High wide shot, slow orbit.
  caps: "גלגל מיקום: מתחלקים לשש קבוצות קטנות." / "חיים שואל, למשל: מי הכי צעיר? — מכל קבוצה, מי שעונה עובר לקבוצה הבאה." / "ועוד שאלות: מי ישן הכי מעט הלילה, מי היה לאחרונה בחו״ל."
- B4 (14 s) SKIP CIRCLE: 12 men in a circle; first each holds the hand of the man one place away (skipping his neighbour - arms crossing in front of the neighbour), then two places away (arms reach further, laughter). Orbit at chest height.
  caps: "מעגל הדילוג: מחזיקים ידיים — לא עם השכן, אלא עם הבא אחריו." / "ואחר כך מדלגים על שניים, שלושה, ארבעה. טוב להפשרת קרח."
- B5 (24 s) THUMB SQUEEZE: (1) circle, each man's right arm forward, thumb up, eyes closed (heads slightly down); Haim walks around behind the circle and squeezes ONE thumb. (2) everybody mingles, pairs face each other and ask (small head-tilt + open-palm shrug). (3) the chosen man, after several pairs, puts both hands on the shoulders of the man who asked him; a "train" grows behind them, hands on shoulders, 5-6 men; the last man runs to join. Three camera moves.
  caps: "לסחוט את האגודל: אגודל למעלה, עיניים עצומות, וחיים סוחט בסוד אגודל אחד." / "כולם מסתובבים ושואלים זה את זה: זה אתה? והתשובה תמיד: אני לא יודע." / "הנבחר עונה כך חמש פעמים, ובשישית שם ידיים על הכתפיים של השואל." / "מי שמבין מצטרף לרכבת מאחור. האחרון שמצטרף — מפסיד."
- B6 (20 s) HELIUM STICK: two teams of 8 men, everybody STANDING in two facing rows per team, each with only the INDEX FINGER under the long thin rod at chest height. The rod first creeps UP (to shoulder height) while they laugh, then slowly comes down together to the floor; the team that reaches the floor crouches with it at the very end. Low 3/4 dolly between the two teams.
  caps: "מקל הליום: שתי קבוצות, ולכל אחת מקל דק, כמו מוט של אוהל." / "כולם תומכים בו באצבע אחת מלמטה, וצריכים להוריד אותו יחד לרצפה." / "אסור לעזוב אותו לרגע. וכשכולם מקפידים לגעת — המקל דווקא עולה."
- B7 (14 s) CHICKEN THROW: circle of 12; the soft yellow rubber chicken is thrown across the circle from man to man (6 throws, each catcher raises his hands to catch); in the second half the throws are clearly faster.
  caps: "זריקת התרנגול: זורקים בובה רכה וקוראים בשם של מי שמקבל." / "בסבב הראשון בונים סדר קבוע. אחר כך — אותו סדר בדיוק, מהר יותר ויותר."
- B8 (16 s) MOLECULES: small groups of 4-5 standing in tight circles; each man holds coloured paper sheets in his hands and has sheets under his feet (red, blue, green, yellow). Haim calls (raises a hand); in each small circle everybody pushes the hand or foot of that colour into the middle of the circle; one man gets it wrong (wrong limb), laughs, and walks to the next circle.
  caps: "מולקולות: לכל אחד ארבעה צבעים — בשתי הידיים ובשתי הרגליים." / "חיים קורא צבע, וכולם מכניסים למרכז את היד או את הרגל בצבע הזה. מי שמתבלבל עובר למעגל הבא."

### film_c - the structure of a workshop (title "שמונת שלבי הסדנה", kicker "חלק ב'") ~1:50
STAGING FOR ALL OF film_c: the group sits on chairs in a wide half-circle facing Haim, who stands by a whiteboard on a stand.
On the whiteboard: the digits 1..8 in a column (digits only). As each stage is explained, its digit gets a gold tick next to it
(digits and ticks are the only marks on the board). Each shot cuts AWAY from the board to a short literal example of that stage
performed by the group (as listed) - the board is a hub, not the whole shot.
- C1 (11 s) slow push-in on Haim at the board, the group seated. caps: "חיים מסביר איך בונים סדנה: שמונה שלבים, ולכל אחד תפקיד." / "ותמיד מתחילים בחיבור."
- C2 (13 s) digit 1 ticked; example: Haim shakes hands and smiles with the first row; the group relaxes and sits back.
  caps: "1. חיבור: קודם לחבר את המשתתפים למנחה — ורק אחר כך תוכן." / "לספר מראש מה יהיה בסדנה, כדי שיהיו רגועים. חיים הביא כאן דוגמה מחתונה."
- C3 (13 s) digit 2 ticked; example: a short replay of the skip circle (B4 staging), shoulders drop, laughter.
  caps: "2. הפשרת קרח: כל עוד יש מתח בחדר — אי אפשר להעביר תוכן." / "עד שבע דקות למשימה. לא עובד? עוברים מיד לבאה."
- C4 (13 s) digits 3 and 4 ticked; example: a quick chicken-throw replay (fast), then a helium-stick replay (one team).
  caps: "3. ממלא אנרגיה: משחק קצר שמעלה את הקצב." / "4. טרום־מרכזית: רואים מי מוביל, מי משתחרר, ומי משתתף פחות."
- C5 (13 s) digits 5 and 6 ticked; example: small groups working seriously together, then everybody laughing together.
  caps: "5. הפעילות המרכזית: לב הסדנה, כעשרים דקות." / "6. משחק סיום: נעים ומחבר — בלי מפסידים."
- C6 (13 s) digits 7 and 8 ticked; example: the group sits in a closed circle on chairs, one man talks, the rest listen and nod.
  caps: "7. עיבוד: יושבים יחד — מה למדנו, מה הבנו. שלב חשוב מאוד." / "8. סגירה: לסיים יחד, ברגע משותף."
- C7 (13 s) THE CLOSING CLAP: everybody standing, both hands raised; Haim claps - everybody claps (hands meet); Haim moves his hands as if to clap but stops just before - nobody claps, they burst out laughing. Front camera, slow crane up.
  caps: "סגירה במחיאת כף: כולם מרימים ידיים. חיים מוחא — כולם מוחאים." / "חיים רק מעמיד פנים — ואף אחד לא מוחא."
- C8 (13 s) THE CYCLE OF A GAME, literally: the group tries the helium stick and the rod goes up (fail); they stop, stand in a huddle talking (2 men gesture); they try again and the rod goes down.
  caps: "וכל משחק עובר מחזור: משחקים, עוצרים ובודקים מה הלך ומה לא —" / "שואלים מה לומדים מזה, ומנסים שוב."
- C9 (10 s) back to the whiteboard; Haim points first to digit 2, then to digit 4, then to digit 6 with the same open hand.
  caps: "ומשחק אחד יכול לשמש בכמה שלבים: התפקיד נקבע לפי הזמן ולפי מה שבא אחריו."

### film_d - after the break (title "אחרי ההפסקה", kicker "חלק ג'") ~2:50
- D1 (13 s) evening light in the windows (blue-violet sky, interior lights on); the group comes back in; Haim stands in front, counts three things on his fingers (1, 2, 3).
  caps: "אחרי הפסקה ותפילת ערבית: איך מציגים משחק? שם, מטרה, ותוכן." / "ומעבר בין משחקים — במילים שמושכות: \"עכשיו משהו עוד יותר מאתגר\"."
- D2 (13 s) POINTS: groups of 4 stand in tight huddles, each man counts on his fingers, then the group nods together. Orbit over one huddle.
  caps: "משחק היכרות עם נקודות: כל קבוצה סוכמת פרטים — גילים, מספר ילדים." / "למשל, יצא 36. ואפשר להוסיף כללים: יש תאומים? עוד נקודות."
- D3 (13 s) COMMON DENOMINATOR: the same huddles; one man lifts his foot and points at his shoe, others laugh; another points to the buttons of his coat. At the end Haim stands in front and everybody laughs together.
  caps: "מכנה משותף מספרי: לכל מספר, לפי הסדר — מה משותף לכולנו?" / "2: לכולנו שתי נעליים. 7: לכולנו שבעה כפתורים. בסוף מקריאים הכול."
- D4 (18 s) GROUP "DOUBLE": pairs play a quick hand game facing each other (rock-paper-scissors hand shake: fist bounces 3 times then a shape); each loser steps BEHIND his winner and cheers with raised arms; winners meet winners; in the end two men face each other in the middle and everybody else stands behind one of them cheering. Crane up at the end.
  caps: "דאבל קבוצתי: אחד מול אחד. מי שמפסיד — הופך למעודד של המנצח." / "זוג מול זוג, ארבעה מול ארבעה — עד שכולם מעודדים את שני האחרונים." / "וכך גם אבן־נייר־ומספריים המוני."
- D5 (14 s) HANDSHAKE GROUPS: men walk around and shake hands with several pumps each (clearly counted pumps: 3); two who match stay together and walk on together; groups grow into 4 groups.
  caps: "כל אחד בוחר בסוד מספר מ־1 עד 4, ולוחץ ידיים כמספר שבחר." / "מי שבחר אותו מספר מצטרף אליו, ונוצרות ארבע קבוצות. ואותו דבר — בקריצות."
- D6 (14 s) THE FIRST TRY THAT FAILED: Haim holds up a stopwatch; men try to sort themselves silently (pointing, holding up fingers, bumping into each other, a messy crowd); Haim stops them with a raised palm; they stand and think.
  caps: "עכשיו: להסתדר לפי המספרים, הכי מהר, בלי לומר מספר בקול. וחיים מודד זמן." / "בפעם הראשונה — לא הצליח. עצרנו לחשוב: מה לא עבד?"
- D7 (15 s) FOUR CORNERS: one participant (not Haim) raises his hand and points to the four corners; a short argument (two men shaking heads and gesturing at different corners); then the white sheets with digits 1..4 are visible in the four corners and the whole group walks quickly to the corners - done. High wide shot.
  caps: "אחד המשתתפים הציע: ארבע פינות החדר — ארבעה מספרים. היו על זה ויכוחים." / "וכשיש מבנה פיזי — ההתארגנות הרבה יותר מהירה."
- D8 (16 s) FINGERS: pairs facing each other; on a beat both throw out fingers of one hand (one shows 2, the other 4); one of them raises his hand first and wins, walks to a new partner; the loser stays.
  caps: "בזוגות: כל אחד מוציא 1 עד 5 אצבעות. מי שאומר ראשון את הסכום — מנצח וממשיך." / "2 ועוד 4: מי שאומר ראשון \"שש\" ניצח. ואפשר חיסור, כפל, ושתי ידיים."
- D9 (14 s) WHY DID YOU CHOOSE: the 4 corner groups standing; in each, one man speaks with a hand on his chest and the others listen and nod. Slow orbit from group to group.
  caps: "ואז שאלה אחת: למה בחרת דווקא את המספר הזה?" / "\"בחרתי 2 — יש לי שני ילדים.\" ומשחק טכני הופך לשיחה אישית."

### film_e - the task (title "עד המפגש הבא", kicker "חלק ד'") ~38 s
- E1 (14 s) evening; the men leave the hall in twos and threes, talking, one demonstrates the finger game to his friend on the way out. Camera pulls back to the door.
  caps: "המשימה של חיים: לנסות לפחות דבר אחד מכל מה שעשינו —" / "ולהרגיש את היכולת שלנו מול קבוצה."
- E2 (12 s) a wide green field of a farm in daylight, a few trees and a wooden fence (no people, no signs, no text). Slow crane.
  caps: "המפגש הבא: בעוד שבועיים, בחוות שמשון — ODT בשטח."
- recap: "סדנה מושכת, לא דוחפת." / "שמונה שלבים, ולכל אחד תפקיד." / "משחקים, בודקים, לומדים — ומנסים שוב."

### film_z - credits (title "סדנה שמושכת", no kicker, no recap) 10 s

## Assembly (supervisor's job)
Remote render per film, concat a..z, music bed (same two azamra342 beds as odt_haim1), loudnorm -16.

## BANNED (grows after each review)
- Anything from v1's metaphors: golden threads, glowing floor discs, station arcs, icon wheels, hourglasses, floating cards, lanterns.
- Any prop not in the PROPS list. Any text on screen except caption ids, the whiteboard digits 1..8 and ticks, and the corner digits 1..4.
- Women or girls; crosses or any religious symbol other than a kippa.
- Hebrew typed directly in the html (caption ids only).
- Close shots straight from behind; near-black kippot; strong orange key light on white shirts.
- Men sitting during a game that is played standing (helium stick, circles, chicken, molecules, double, corners).
