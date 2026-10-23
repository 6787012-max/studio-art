# BRIEF - film_story: "Uri and the little robot" (2 minutes, demo of the new kit)

Builder: Sonnet worker. Read first: C:/Users/יוסף שניידר/.claude/skills/video-production/SKILL.md (section 6 rules bind you, 5c is the checklist), productions/_kit_build/README.md, productions/_kit_build/film_demo.html (copy its head and patterns), lib/stage3d.js, lib/glb3d.js, lib/props3d.js, lib/motion3d.js, productions/azamra342/road.js (boy(), route(), cine(), mkShot() patterns).
Output: ONE page `productions/story_demo/film_story.html` (1920x1080, film() with title card + recap). Total duration (sum of shots + title 4.2 s + recap 9 s) must be 120 s +- 3 s. Check `window.__dur`.

## Audience and look
Children about 10. Warm, bright, friendly, toon+ink house style. Men and boys only (no women/girls). Hero = the boy "Uri" (BOY look from road.js: kippa, scale .72, hat none). Friends: RobotExpressive GLB (CC0) = the lost little robot; Fox GLB = the fox guide. No sacred objects, no ritual items. One central idea: helping a friend find home.
Camera: every shot moves slowly (dolly/crane/pushIn/path); hero visible and large by 3 s; no empty sky; hold the key moment still >= 1 s; no handheld shake. Palette: sunny greens, warm sand, blue sky, sunset orange for shot 11.

## Shots (dur 10 s each = 11 shots) and EXACT captions (2 captions per shot, each >= 4.5 s, on screen text ONLY these)
Title card kicker (Hebrew): the film title given in TITLE below. Recap card (3 lines) given in RECAP.
TITLE: אורי והרובוט הקטן
RECAP: 1) מי שעוזר לחבר מוצא בדרך גם שמחה  2) כל סימן קטן בדרך יכול להוביל הביתה  3) טוב שיש חברים שלא מוותרים

| # | World / action | Camera | Captions |
|---|---|---|---|
| 1 | Village at sunrise (houses, trees, fence, well). Uri walks along stepping stones toward camera, waves. | slow crane down from high to eye level | בבוקר אחד בכפר, אורי יצא לטייל. / השמש עלתה, והכול נראה חדש. |
| 2 | Same village, Uri stops; the Fox peeks from behind a bush/rock, looks at him (Fox clip Survey), then runs. | pushIn on Uri then pan to fox | פתאום הוא ראה שועל קטן בין האבנים. / השועל הסתכל עליו, ורץ. |
| 3 | Uri follows the fox along a path past trees and fence (follow()); fox Run, Uri walks fast. | side tracking dolly | אורי החליט ללכת אחריו. / הדרך עברה בין העצים והגדרות. |
| 4 | Next to the well: the Robot (Idle then Wave) alone, looks lost. Uri arrives. | orbit around the robot, ends on both | ליד הבאר עמד רובוט קטן ועצוב. / הוא נופף ואמר: שלום, חבר! |
| 5 | Robot shrugs (Yes/No clips), Uri points and puts a hand on his chest (gesture heart or offer). | slow pushIn medium two-shot | הרובוט לא זכר איפה הבית שלו. / אורי אמר: אל תדאג, אני אעזור לך. |
| 6 | Town square with fountain, tents, benches, crowd of 8-10 men/boys walking (crowd()). Uri and Robot ask around (Uri gestures explain). | high crane over the square then down | בכיכר היו הרבה אנשים. / שאלו אותם, אבל אף אחד לא ידע. |
| 7 | Signpost with 3 arrows (label sprite shapes only, no text needed). Uri thinks (gesture think), Robot scratches head (Idle). | orbit slowly | ליד השלט הם עצרו וחשבו. / מי יכול לעזור להם? |
| 8 | Fox returns at the edge of the square, waits, turns, runs toward the sea (distant blue strip). | camera follows fox then reveals the horizon | והשועל חזר, כאילו אמר: בואו אחריי! / הם רצו אחריו אל הים. |
| 9 | Beach: sand, sea, boat, flag, the old white Milk Truck GLB parked. Robot sees it, Run/Walk to it. | wide establishing then pushIn to truck | על החוף עמדה משאית ישנה. / והרובוט צעק: זה הבית שלי! |
| 10 | Robot jumps (Jump), dances (Dance) in front of the truck, Uri claps (gesture), Fox sits. | crane around the group, ends wide | הרובוט קפץ משמחה. / תודה, אורי! ידעת לעזור לי. |
| 11 | Sunset (orange sky), Uri in the study room (buildRoom or the table+bookshelf props), opens a book (open book prop), lamp glow, window. | slow dolly toward the table | בערב חזר אורי הביתה, עייף ומאושר. / הוא פתח ספר, וחשב על היום שעבר. |

Credits: in the recap card region or last shot add small English text (not Hebrew) on the final shot bottom-left: "Fox: PixelMannen CC0, rig/animation: @tomkranis CC BY 4.0 - Robot: Tomas Laulhe CC0 - Truck: Cesium CC BY 4.0" - confirm exact credit strings from productions/_kit_build/README.md and assets_net/LICENSES.md; do not invent.

## Rules for you
- Deterministic: preloadGLBs before film(); no Math.random/Date/rAF.
- Do NOT render the full video. Use stills: `PYTHONIOENCODING=utf-8 python tools/stills.py productions/story_demo/film_story.html <scratch>/stills --times <2 times per shot> --size 1920x1080 --sheet ...` then safe_view.py, LOOK at CLEAN JPGs. Fix: character facing wrong way, floating, inside props, camera in geometry, empty sky, captions cut off, boy too small, clips not playing (T-pose), wrong clip names. Also run the numeric gate if tools/check.py exists.
- Captions: type them exactly as in the table, in order; make sure the Hebrew renders right-to-left, fonts loaded.
- Write files with the Write tool; forward slashes; no Hebrew username in paths; close all browsers.
- Report briefly in English (no Hebrew): file, __dur, which stills you checked and what you fixed, known defects.
