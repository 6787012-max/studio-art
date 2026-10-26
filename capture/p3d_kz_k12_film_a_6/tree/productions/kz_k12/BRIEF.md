# kz_k12 BRIEF - 3D scene build (supervisor, 26/10/2026)

Series "katzar velainyan" (Rabbi Avshalom Schneider), chapter k12. Horizontal 1920x1080. The Rav's real voice and the captions are
mixed LOCALLY later (ketzarim/assemble3d.py burns the captions as ASS). The page must contain NO audio, NO captions and NO Hebrew
text at all (digits are allowed on props). The picture must ACT OUT the idea of each spoken passage.

## Read first (copy, do not invent)
1. `C:/projects/_studio-animatzia/productions/kz_k12/STORYBOARD.md` - the shot-by-shot plan (this is the contract).
2. `C:/projects/_studio-animatzia/productions/kz_k12/shots_k12.json` - LOCKED shot durations (clip time). 24 shots: s01..s23 follow
   the storyboard rows in order (storyboard row 16 is split into s16 = ring of lit houses and s17 = rays from the windows to the book;
   s18 = the cities map row; s19 = seedling row; s20 = street row; s21 = rain/sun row; s22 = lanterns-into-windows row; s23 = the
   final table row), and s24 = 4.8 s end-card shot (calm wide of the clear glasses on the table, slow pull back, NO text - the end
   title is burned later).
3. Structure to copy: `C:/projects/_studio-animatzia/productions/k11_masach/` (`k11.html` with the DURS array and one object per shot,
   `k11lib.js` shared world/helpers, `k11fx.js` effects). Same engine (`lib/stage3d.js`), same film()/shot API, same head/importmap.
4. Engine rules and quality bar: `~/.claude/skills/video-production/references/builder_kit.md`,
   `C:/projects/_studio-animatzia/productions/toldot06/BRIEF.md`. Props: `lib/props3d.js`, primitives `box cyl ball` in stage3d.js,
   asset search `python C:/projects/_studio-animatzia/tools/assetlib.py search <words> --cat prop` (CC-BY assets: list them in
   `kz_k12/CREDITS.txt`).

## Output files (all inside `C:/projects/_studio-animatzia/productions/kz_k12/`)
`film_a.html` (the film, DURS = the 24 durations from shots_k12.json, in order; `window.__dur` must equal their sum),
`k12lib.js`, `k12fx.js` (names free), `CREDITS.txt` if any asset is used. Nothing else in this folder (no stills, no renders, no
logs - the whole folder is uploaded to the PUBLIC render repo).

## Look (numbers)
- Palette: sage #9CCBA8, coral #F28C6B, cream #FFF4E0, sky #A8D8F0, honey #F5B84A (spice only), ink outline #3A2E28. Flat toon
  materials, soft shadows, clean simple backgrounds, bright. Never dark or black (the Purim plain is deep blue #2E4A7A with warm lanterns).
- Different from k11 (walnut/plum) and k10 (indigo): this is fresh early spring.
- NO characters at all. People are only implied by objects (slippers, children's small shoes, lanterns, lit windows).
- THE GLASSES (recurring hero prop, build once in k12lib.js): round frames of warm wood (#A0703C), two lens discs with a haze layer
  whose opacity is a parameter 0..1 (haze colour #D9C2C8). Objects seen THROUGH the lenses get a pale/outline look while haze > 0
  (simplest robust way: a duplicate "faded" version of the objects revealed inside the lens circle, or fade the objects as the glasses
  pass in front - choose what renders reliably). Reused in s05, s08, s12, s13, s23, s24.
- No religious ritual objects as props except: a closed rolled scroll (Megillah, s01/s14/s15/s22) and an open book on a stand (s02, s16, s17).
  No sefer Torah, no tefillin/tallit. No idols, no crosses. No money symbols other than plain gold coins and the digits 100 / 200.
- Every shot: camera always moving (dolly/orbit/crane, eased), frame 0 of every shot not empty, the key object visible within 3 s,
  nothing important cut by the frame edge, fill the frame (no big empty areas). Transitions: soft dissolves through light or continuous
  camera moves between related shots (s05->s08 glasses, s14->s15 scroll, s21->s22 street->lanterns, s22->s23 fly into a window).
- Each spoken idea = one visible 3D action performed by an object (see storyboard). Time actions inside a shot by its duration
  (e.g. action at 0.3*dur), never by absolute film seconds, so small duration changes do not break anything.

## Shot notes beyond the storyboard
- s13 (35 s, the thanks list): five object "beats" spaced through the shot: speech bubble (at ~0.2), a generic soft sparkle (~0.35, no
  specific object), the standing slippers (~0.45), a small fridge with its door opening on bread and fruit (~0.6), a pair of simple
  gloves = good hands (~0.72); haze on the glasses drops in steps with each beat, fully clear by ~0.85.
- s09: the two stacks carry the digits 100 (solid) and 200 (ghost outline) on a disc in front of each stack.
- s20: NO number on the timeline ribbon (just a rising curve of light along the street).
- s18: six building clusters rise one after another, evenly through the shot; no names on the map.

## Gates before you report
1. Stills: `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/kz_k12/film_a.html
   D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/ketzarim/k12_review/stills --times <mid-time of every shot, 24 values>
   --fmt jpg --size 960x540 --timeout 900` (stills go OUTSIDE the production folder), then
   `python tools/safe_view.py <that stills dir> --out D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/ketzarim/k12_review/clean --sheet 4`
   and look ONLY at the files it marks CLEAN. NEVER open a PNG directly. Fix anything empty, cut, dark, unreadable or off-storyboard.
2. `python tools/verify_scene.py productions/kz_k12/film_a.html --out D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/ketzarim/k12_review/verify --timeout 900`
   must PASS (zero P0/P1). Batch fixes, then ONE full verify; `--shot <id>` for small re-checks. Copy the PASS report to
   `productions/kz_k12/VERIFY_REPORT.json`.
3. Run with swiftshader only (no GPU), idle priority. Do NOT render the film, do NOT upload anything, do NOT send mail.
- Python/JSON written with the Write tool only (never heredoc); `rm` only with full absolute paths.
- Do NOT read any Hebrew transcript or *.txt ASR file in ketzarim/ - you do not need them.
- Do not spawn sub-agents unless essential; then one cheap, well-defined agent.

## Report back (short)
Paths of film_a.html and helpers; window.__dur; the CLEAN contact-sheet paths; verify status; one line per shot saying what object
action it shows; any doubt.
