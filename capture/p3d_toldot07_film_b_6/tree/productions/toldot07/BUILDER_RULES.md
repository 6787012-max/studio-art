# Builder instructions for productions/toldot07 (no Hebrew in this file)

Read, in this order, and nothing else of Hebrew nature:
1. C:/Users/~/.claude/skills/video-production/references/builder_kit.md  (use the real home folder; the engine API, gestures, worker rules)
2. C:/projects/_studio-animatzia/productions/toldot07/BRIEF.ids.md  (shot table; captions appear as vault IDs only)
3. C:/projects/_studio-animatzia/productions/toldot07/timeline_film_b.json  (shot durations, caption `at`/`until` times: use them for `capAt`)
4. Reference code to COPY from, never start empty: productions/azamra342/_head_example.html (page head), productions/azamra342/film_b.html + road.js (shared-module pattern, boy(), cine(), mkShot()), productions/toldot06/film_b.html (rain, clouds, water, camera paths), productions/_kit_build/film_demo.html (props3d, glb actors, motion3d), lib/stage3d.js, lib/figure3d.js, lib/props3d.js, lib/motion3d.js.

## File architecture (parallel builders)
- productions/toldot07/shared.js : BOY and RAV look constants + helpers (person wrappers `boy(Wd, fn)`, `rav(Wd, fn)`), `mkShot`/camera helpers. Built once by the FIRST builder, then only extended by appending.
- productions/toldot07/sea.js : `sea(Wd, opts)`, `beach(Wd, opts)`, `bottle(Wd, fn)` as specified in the BRIEF (rolling toon water, pure function of t, foam crests, heightAt(x,z,t), sloping sand strip with a wave that rises, curls, breaks to foam, runs up and soaks away). Built once by the FIRST builder.
- Each part is an ES module `productions/toldot07/b_pN.js` that `export const shots = [ ... ]` (engine shot objects: `{dur, caps:[vault IDs], capAt:[...], build(){...}}`), importing from '../../lib/stage3d.js', './shared.js', './sea.js'. Caption IDs come from BRIEF.ids.md in order (CAP_B_01 ...). `dur`, `capAt` from timeline_film_b.json (shot s01 = B1 ...).
- For testing, write `productions/toldot07/test_pN.html` = the page head from the reference + `film({vault:'captions_vault.json', shots: shots_of_this_part})` (no title card needed: omit kicker/title/recap in the test page).
- The final `film_b.html` is assembled by the supervisor (imports all parts). Do not create it.

## Verify
`cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/verify_scene.py productions/toldot07/test_pN.html` (add `--shot <id>` for a single shot). Fix every P0/P1 and re-run until PASS. Read only the JPG sheets it produces (never a PNG). Close every process you start.

## Quality (the supervisor judges this)
A real film, not slides: every shot has camera movement, one readable idea, a visible hero by 3 s, bright warm light, toon + ink. Follow the BRIEF numbers (palette hex, durations, camera). Use `Wd.hero = obj`. No Hebrew text anywhere in code: labels via vault IDs LBL_B_xx (see BRIEF.ids.md for which label sits in which shot) and captions via CAP_B_xx.
Report: files created, final verify result lines, known defects, which shots you consider weakest. No Hebrew in the report.

## Added 23/10 (supervisor)
- Do not spawn sub-agents unless essential, and then only one cheap well-defined one.
- shared.js and sea.js now exist (read their header comments; extend only by APPENDING, never change existing exports). Look approved from B1-B2: water shader, bottle, light. Keep the same sky/fog via seaWorld(). b_p1.js is the reference for how a part is written.
- Known: beach().tongue() (run-up wave) is untested - the builder of B8/B9 tests and fixes it in sea.js carefully (append-only API, other parts depend on it).
- The bottle hero may be scaled up (about 1.5 m) for the hero-size gate; in B5 it must be 40 % of frame height anyway.
- Hero gate: `Wd.hero` must be a REAL visible object, not an invisible proxy box.
- Characters must be big enough on screen to read (>= 35 % frame height in their key shot); wind ribbons thick (>= 0.05 m) so they read at phone size.
- verify_scene is heavy: run it once per fix round, with idle priority if possible, never several rounds in parallel.
