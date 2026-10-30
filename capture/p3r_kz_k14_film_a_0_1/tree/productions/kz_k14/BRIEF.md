# kz_k14 BRIEF - 3D scene build (supervisor, 30/10/2026)

Series "katzar velainyan" (Rabbi Avshalom Schneider), chapter k14. Horizontal 1920x1080. The Rav's real voice and the captions are
mixed LOCALLY later (ketzarim/assemble3d.py burns the captions as ASS). The page must contain NO audio, NO captions and NO Hebrew
or Latin text at all (digits are allowed on props). The picture must ACT OUT the idea of each spoken passage.
Captions are burned in the lower part of the frame later: keep the lowest 22% of the frame free of key action (background only).

## Read first (copy, do not invent)
1. `C:/projects/_studio-animatzia/productions/kz_k14/STORYBOARD.md` - the shot-by-shot plan (this is the contract).
2. `C:/projects/_studio-animatzia/productions/kz_k14/shots_k14.json` - LOCKED shot durations (clip time): s01..s29 = storyboard
   rows in order, then `s_end` = 4.8 s end-card shot (see storyboard, NO text).
3. Structure to copy: the previous chapter `C:/projects/_studio-animatzia/productions/kz_k13/` (`film_a.html` with the DURS array
   and one object per shot, `k13lib.js` shared world/helpers, `k13fx.js` effects). Same engine (`lib/stage3d.js`), same film()/shot
   API, same head/importmap. Read `kz_k13/BRIEF.md` too - its rules apply here (with k14 names and the k14 look below).
4. Engine rules and quality bar: `~/.claude/skills/video-production/references/builder_kit.md`,
   `C:/projects/_studio-animatzia/productions/toldot06/BRIEF.md`. Props: `lib/props3d.js`, primitives `box cyl ball` in stage3d.js,
   asset search `python C:/projects/_studio-animatzia/tools/assetlib.py search <words> --cat prop` (CC-BY assets: list them in
   `kz_k14/CREDITS.txt`).

## Output files (all inside `C:/projects/_studio-animatzia/productions/kz_k14/`)
`film_a.html` (DURS = the 30 durations from shots_k14.json, in order; `window.__dur` must equal their sum), `k14lib.js`,
`k14fx.js`, `CREDITS.txt` if any asset is used. Keep STORYBOARD.md, BRIEF.md, shots_k14.json, shot_src_starts.json. Nothing else
(no stills, renders, logs - the whole folder is uploaded to the PUBLIC render repo).

## Look (numbers)
- Palette: soft teal #3E8E8A, peach #F2B48C, butter cream #FFF4E0, sky mint #CFE8E4, sunflower #F2C14E (spice only: the dot and the
  crown light), ink outline #24414A, empty-gap warm grey #A9A39A. Flat toon materials, soft shadows, clean simple backgrounds,
  bright. Never dark or black. Must look clearly different from k13 (slate blue / terracotta / winter road).
- NO characters at all, no faces anywhere (no faces on balloons, toys or boxes).
- Recurring hero objects (build once in k14lib.js, reuse):
  * DAY RIBBON: a long strip of 24 equal rounded tiles (teal/peach alternating), s03-s05, s10, s15-s18, s20-s22, s28, s_end.
  * GREY GAP: 2 tiles missing, replaced by a hollow wire-frame box in warm grey; it can lift out, tilt, glow and open like a box.
  * ENTERTAINMENT BOXES: bright gift-like boxes, a suitcase, a film reel (a disc with holes), a ticket stub, a music-note shape,
    balloons (no faces, no instruments, no screens with images).
  * BET-HOUSE: an open-front house shape (roof bar, back wall, floor bar that extends forward) in teal with cream inside, and a
    golden glowing DOT inside it (s01, s08, s26, s27, s29, s_end). It is a 3D shape built from boxes, NOT a text glyph.
  * CROWN LIGHT: a simple golden crown made of a ring with 5 rounded points, glowing softly, high above (s09, s11-s16, s20).
- Allowed religious objects: an open book on a stand, candles in holders. No sefer Torah, tefillin, tallit, idols, crosses.
- s12 bed: an empty small bed with a blanket only (nobody in it). s17 kitchen: no people, no screens.
- Every shot: camera always moving (dolly/orbit/crane, eased), frame 0 of every shot not empty, the key object visible within 3 s,
  nothing important cut by the frame edge, fill the frame. Transitions: soft dissolves through light, or continuous camera moves
  between related shots (s04->s05 into the gap, s15->s16 gap lifts, s20->s21->s22 tilted gap opens, s28->s29).
- Each spoken idea = one visible 3D action performed by an object (see storyboard). Time actions inside a shot by its duration
  (e.g. at 0.3*dur), never by absolute film seconds.

## Gates before you report
1. Stills: `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/kz_k14/film_a.html
   D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/ketzarim/k14_review/stills --times <mid-time of every shot, 30 values>
   --fmt jpg --size 960x540 --timeout 900` (stills go OUTSIDE the production folder), then
   `python tools/safe_view.py <that stills dir> --out D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/ketzarim/k14_review/clean --sheet 4`
   and look ONLY at the files it marks CLEAN. NEVER open a PNG directly. Fix anything empty, cut, dark, unreadable or off-storyboard.
2. `python tools/verify_scene.py productions/kz_k14/film_a.html --out D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/ketzarim/k14_review/verify --timeout 900`
   must PASS (zero P0/P1). Batch fixes, then ONE full verify; `--shot <id>` for small re-checks. Copy the PASS report to
   `productions/kz_k14/VERIFY_REPORT.json`.
3. Swiftshader only (no GPU), idle priority. Do NOT render the film, do NOT upload anything, do NOT send mail.
- Python/JSON written with the Write tool only (never heredoc); `rm` only with full absolute paths.
- Do NOT read any Hebrew transcript, caption or *.txt ASR file in ketzarim/ - you do not need them.
- Do not spawn sub-agents unless essential; then one cheap, well-defined agent.

## Report back (short)
Paths of film_a.html and helpers; window.__dur; the CLEAN contact-sheet paths; verify status; one line per shot saying what object
action it shows; any doubt.
