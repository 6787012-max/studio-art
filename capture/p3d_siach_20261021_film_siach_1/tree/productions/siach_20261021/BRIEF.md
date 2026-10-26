# BRIEF - film_siach: morning talk 21/10/2026 (Mechina Beit HaTalmud) - a 3D film for the builders

Source: the real morning talk in the beit midrash (recorded audio). The REAL VOICE of the speaker plays under the whole film (6 clips, 234.8 s in total, kept in the day folder, mixed locally later - do NOT add any audio to the page). The picture must act out what is said; captions summarise it (Hebrew, ids only for builders).
Audience: Haredi boys, mechina age 13-17. Shown with the real talk audio + soft music.
Central idea: holiness stays in a place. A grandson sits 140 years later on the bench where a tzaddik prayed and feels it; a great rabbi walking in an old orchard stops - this spot feels holy; the walls of a home record everything like a memory stick, and Hashem sees all; Avraham walked the length and breadth of the land (this week's parasha) and put holiness into every step; Jews abroad buy boxes of earth from Eretz Yisrael while we walk on it every day - so keep it clean, it is the King's palace; the coming trip is not "just a trip".
Engine, rules, quality bar: exactly `C:/Users/<user>/.claude/skills/video-production/references/builder_kit.md` and reference productions `productions/siach_20261023/film_siach.html` + `shul.js` + `shared.js` (SAME SERIES, same look - COPY its boy look, rav look, prayer-light helper, palette, shul interior), and `productions/azamra342/` (road.js for outdoor paths and hills).
Output: ONE page `productions/siach_20261021/film_siach.html` (1920x1080, film() with title card + recap + vault). Shot durations are LOCKED to the audio (timeline.json) - never change a shot duration. Check `window.__dur`. The title card overlays the first 4.2 s of A1 (no leading silence).

## Look constants (numbers, not adjectives) - same series as siach_20261023
- Warm bright palette: sky top #7EC8F0, sky bottom #FFF1C9, ground warm stone #E9D3A1, accent gold #F5B820, holiness-glow gold #FFD54A (soft glowing spheres / soft ground glow with ink outline #3A2A12 where it is an object), calm blue #3C7FD8, green #5CAA4A, orchard leaf #4E8F3A, orange fruit #F29A2E. Key light near-neutral (white shirts must stay white - see failure log 24/10); colour only in sky/window.
- THE BOY (hero of C, E, F): same `boy()` look as siach_20261023, kippa visible, `{scale:.72}`.
- THE TZADDIK (A1-A3): white long beard, long black coat, black hat (hatColor visible), scale .8.
- THE GRANDSON (A4): younger man, short dark beard, black coat, black hat, scale .8.
- THE GREAT RABBI in the orchard (B2-B4): elder, white beard, black coat, black hat, scale .8; shown medium/wide and from the side or behind - never a close-up of the face. THE BACHUR beside him: older boy look (boy() scale .78, kippa).
- AVRAHAM (D1-D4): ancient-time elder, white beard, long sand-coloured robe #CDB68A, head cloth #E8E0C8 (counts as head covering), staff. ALWAYS seen from behind, from far, or in silhouette against the sky - NEVER a face close-up.
- THE MAN ABROAD (E1): grey beard, dark coat, black hat, scale .78.
- Every male figure has a visible kippa or hat. Men and boys only - no women or girls anywhere. No crosses/churches/mosques. No ritual objects as props (no sefer Torah, tefillin, tallit).
- BANNED: dark/black skies, empty stage after a caption leaves, figures cut by frame edge, hero smaller than 40% of frame height in his key shot, still 1-second windows (camera always moves), text or letters on any prop/screen, death imagery (the tzaddik simply walks out through the door), hard cuts more than 1/3 of seams, a crane that starts inside a mesh (blank first frame).

## Characters and gestures (working list only)
rest explain point wide think up offer heart shrug count hips. Everything else is a defect.

## Seams
A1-A4 one old wooden beit knesset, continuous camera; A4->B1 dissolve through the window light into the sunny orchard; B1-B4 one orchard; B4->C1 dissolve through gold glow into the boy's room; C1-C4 room -> memory stick macro -> pull out through window to sky (continuous); C4->D1 dissolve through the sky into an ancient hill landscape; D1-D5 one landscape, continuous; D5->E1 hard cut allowed (city abroad, light snow, still bright); E1->E2 dissolve through the open box of earth into the stone path in Eretz Yisrael; E2->F1 continuous; F1-F2 continuous, ends very wide and rising. Stage ground opaque (no white flash).

### film_siach - morning talk (title "קדושה שנשארת", kicker "שיח הבוקר בבית המדרש · פרשת לך לך תשפ״ז")
- A1 (11.4 s) an old small wooden beit knesset, warm window light; one simple wooden bench by the window; dust motes in the light beam; slow crane down from the ceiling beams (start BELOW the beams, not inside) to the bench.
  caps: "ספסל עץ פשוט בבית כנסת ישן" / "לפני 140 שנה ישב עליו צדיק והתפלל"
- A2 (11.3 s) THE TZADDIK sits on the bench and prays (gesture heart, then up); small gold lights rise from him, and some float down and sink softly into the wood - the bench gets a faint gold glow that grows over the shot (pure function of t). Slow pushIn at medium height.
  caps: "כל תפילה שלו השאירה שם משהו" / "עוד ועוד, יום אחרי יום"
- A3 (11.4 s) THE TZADDIK stands and walks out through the door into the light (no death imagery); time-lapse: the window light sweeps dawn->noon->dusk many times (cycles accelerate), dust settles, the bench stays and its faint gold glow stays. Slow orbit 40 deg around the bench.
  caps: "שנים רבות עברו" / "אבל משהו נשאר בספסל"
- A4 (11.3 s) THE GRANDSON enters, sits on the same bench; the faint gold glow rises from the wood and wraps him softly; he closes his eyes (heart), then looks around in wonder (wide). Camera rises from low beside the bench to medium.
  caps: "נכדו מתיישב על אותו ספסל" / "ומרגיש: יש כאן קדושה"
- B1 (10.5 s) a big old orchard of orange trees on sandy ground, sunny, long rows; two or three boys run along a row (rest/point) far off. Slow dolly along the row.
  caps: "פעם, בבני ברק, היה פרדס גדול" / "ילדים שיחקו בו ועברו בו כל יום"
- B2 (10.5 s) THE GREAT RABBI walks slowly along the orchard path with THE BACHUR, talking (explain / think). Tracking camera beside them at a respectful medium-wide distance.
  caps: "גדול הדור טייל שם עם בחור" / "והם דיברו בדברי תורה"
- B3 (10.5 s) the rabbi suddenly stops at one spot under a tree (gesture rest, then point at the ground); a soft gold glow rises from the ground around that tree. The bachur looks (shrug). Camera swings low to show the glow and both men.
  caps: "פתאום הוא נעצר" / "המקום הזה מרגיש אחרת"
- B4 (10.5 s) at that tree a translucent gold figure of a man praying long ago appears faintly (a memory, semi-transparent, kippa visible) and fades; the two stand quietly. Slow pull back and rise to a wide of the orchard.
  caps: "אולי צדיק עבד כאן את ה' פעם" / "מקום זוכר את מה שנעשה בו"
- C1 (11.8 s) THE BOY in his simple room learning at his desk (gesture think, then up); where he sits, the wall stones and the wooden shelf glow faintly gold for a moment, as if they "notice". Slow orbit around him.
  caps: "גם הקירות של הבית רואים הכול" / "האבנים והעץ מעידים על מה שנעשה"
- C2 (11.8 s) on the desk a small memory stick (simple rounded box, no text); camera pushes into it macro; inside, a tunnel of thousands of tiny glowing picture frames (blank, no text) streams past.
  caps: "מקל זיכרון קטן מחזיק אלפי תמונות" / "הכול שמור בתוכו"
- C3 (11.8 s) camera flies back out of the stick, across the room and out through the window up into a bright sky (continuous move, start outside any mesh).
  caps: "אם אדם יכול לבנות דבר כזה" / "מי שברא את הכוח הזה רואה הכול"
- C4 (11.9 s) high in a warm sky a large soft frame of light (no text, no faces) shows a gentle replay: small glowing silhouettes of the boy's good moments (learning, helping) drift by; below, the house roof. Slow crane down toward the roof.
  caps: "כל מעשה נשמר" / "גם מה שאף אחד לא ראה"
- D1 (11.4 s) ancient hill country at morning: a tent, AVRAHAM seen from behind at the tent entrance, looking out over the hills; he stands up (up). Slow pushIn from behind him over his shoulder to the landscape.
  caps: "בפרשת השבוע ה' אומר לאברהם" / "קום, התהלך בארץ"
- D2 (11.4 s) AVRAHAM walks across the hills with his staff, seen from far / behind; behind each footstep a small gold glow stays on the ground (a growing trail, pure function of t). Side tracking wide.
  caps: "לאורכה ולרוחבה" / "ובכל צעד הוא מכניס קדושה"
- D3 (11.4 s) aerial: the gold footprint trail winds across the whole land, over hills and valleys, past small stone hill towns (no labels). Crane up and forward.
  caps: "ממקום למקום, בכל הארץ" / "כדי שהארץ תהיה מוכנה לבנים"
- D4 (11.4 s) AVRAHAM in silhouette on a hilltop against the sky looks down: on the same glowing trail far below, a group of modern mechina boys (boy() looks, kippot) walk. Slow orbit behind his silhouette.
  caps: "לך ולזרעך אתננה" / "לך ולכל הילדים שלך"
- D5 (11.4 s) inside a bright beit midrash (shul.js interior) boys learn at shtenders; through the windows the glowing land; soft gold light rises gently from the floor. Slow dolly.
  caps: "בארץ ישראל יש קדושה מיוחדת" / "ובה הלימוד מצליח יותר"
- E1 (10.5 s) a city far away with light snow (still bright, blue-white sky): THE MAN ABROAD in his warm-lit room opens a small wooden box of stones and earth, holds a stone with love (heart, offer). PushIn.
  caps: "רחוק מכאן, יהודים קונים עפר מארץ ישראל" / "ושומרים אותו כמו אוצר"
- E2 (10.5 s) bright stone path in Eretz Yisrael; THE BOY walks, the stones under his feet glow faintly; he sees a wrapper on the ground, picks it up and puts it in a bin (offer), smiles. Tracking low beside his feet, then up to medium.
  caps: "ואנחנו דורכים עליו כל יום" / "זה הארמון של המלך, שומרים עליו"
- F1 (11.05 s) a group of mechina boys with backpacks walk up a sunny hillside trail together (point, wide); THE BOY in front. Side tracking.
  caps: "הטיול הקרוב איננו סתם טיול" / "כל ארבע אמות בארץ ישראל"
- F2 (11.05 s) very wide: the group on the hill path, their gold footprints join the ancient gold trail of D2 crossing the land; crane up and back, calm end.
  caps: "הליכה במקום מיוחד" / "ומתנהגים בהתאם"
- recap: "מקום זוכר את מה שנעשה בו" / "אברהם הלך בארץ וקידש אותה" / "כל צעד שלנו בה הוא צעד בארמון המלך"

## Rules for the builder
Follow the worker rules block in builder_kit.md. Captions only as vault IDs. Do not render video. Report in English, no Hebrew. Do not spawn sub-agents unless essential, and then one cheap, well-defined one.
