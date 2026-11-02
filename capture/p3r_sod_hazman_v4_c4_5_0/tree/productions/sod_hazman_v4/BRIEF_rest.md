# sod_hazman_v4 - build brief for chapters c1b..c10 (supervisor, 02/11/2026 night)

The owner approved chapter c1 ("cute, captions look good"). Build the remaining chapters the SAME way.
Read: BRIEF_c1.md (rules, module specs), DIRECTION.md (sets per chapter), c1.html (the reference chapter - copy its
structure), timeline.json (your chapters), captions_vault.json (IDs only, never print values), mouth_<chapter>.json.

## Shared modules are FROZEN
`lib_v4/caption3d.js`, `lib_v4/watch.js`, `lib_v4/dof.js`, `lib_v4/objects.js` are used by every chapter and by other
builders working in parallel right now. Do NOT edit them. New props/sets go in `lib_v4/objects_<chapterId>.js` (yours only).
If a shared module truly blocks you, stop and report instead of editing it.

## Per chapter
- File `<chapterId>.html` (e.g. c2.html), every time from timeline.json (chapter dur, line t0/t1/end/dwell/hold), captions by
  vault ID via caption3d, the watch on every W line (right-center, 45-60% frame height, thought frame on the left).
- Follow each line's `visual` note + DIRECTION.md set list. The explained object must MOVE during `dwell` (build the
  diagram step by step, counters roll, arrows draw) - never a frozen frame. Camera move on every shot, cuts every 3-6 s
  inside long lines, 3 depth layers, warm cinematic light.
- Accuracy matters (it is a lesson): 24h ring, 12 equal segments of the day between sunrise and sunset, Earth tilt 23.5 deg
  with the axis always pointing the same way around the orbit, terminator line, moon phases in the right order, the
  sun's arc lower and shorter in winter. Numbers on screen only as digits that also appear in the line's words.
- NO people of any kind, no hands. No smartphones anywhere: a phone is always a small keypad phone (physical number keys).
- verify: `python tools/verify_scene.py productions/sod_hazman_v4/<chapterId>.html` must PASS with the default gate
  (zero P0/P1). JPG stills one per line id in `_stills_<chapterId>/`.

## Done =
For each of your chapters: html + objects file + PASS line + stills folder. Report per chapter: verify summary line,
known weak spots. No full video render. Do not start sub-agents unless essential. Close every process you opened
(never taskkill msedge.exe). Never read PNG files. Zero Hebrew in anything you write or print.
