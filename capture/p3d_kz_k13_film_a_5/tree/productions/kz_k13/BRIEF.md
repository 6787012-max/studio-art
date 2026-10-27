# kz_k13 BRIEF - 3D scene build (supervisor, 27/10/2026)

Series "katzar velainyan" (Rabbi Avshalom Schneider), chapter k13. Horizontal 1920x1080. The Rav's real voice and the captions are
mixed LOCALLY later (ketzarim/assemble3d.py burns the captions as ASS). The page must contain NO audio, NO captions and NO Hebrew
or Latin text at all (digits are allowed on props). The picture must ACT OUT the idea of each spoken passage.
Captions are burned in the lower part of the frame later: keep the lowest 22% of the frame free of key action (background only).

## Read first (copy, do not invent)
1. `C:/projects/_studio-animatzia/productions/kz_k13/STORYBOARD.md` - the shot-by-shot plan (this is the contract).
2. `C:/projects/_studio-animatzia/productions/kz_k13/shots_k13.json` - LOCKED shot durations (clip time): s01..s28 = storyboard
   rows in order, then `s_end` = 4.8 s end-card shot (calm wide of the road to the gate, slow pull back, NO text).
3. Structure to copy: the previous chapter `C:/projects/_studio-animatzia/productions/kz_k12/` (`film_a.html` with the DURS array
   and one object per shot, `k12lib.js` shared world/helpers, `k12fx.js` effects). Same engine (`lib/stage3d.js`), same film()/shot
   API, same head/importmap. Read `kz_k12/BRIEF.md` too - its rules apply here.
4. Engine rules and quality bar: `~/.claude/skills/video-production/references/builder_kit.md`,
   `C:/projects/_studio-animatzia/productions/toldot06/BRIEF.md`. Props: `lib/props3d.js`, primitives `box cyl ball` in stage3d.js,
   asset search `python C:/projects/_studio-animatzia/tools/assetlib.py search <words> --cat prop` (CC-BY assets: list them in
   `kz_k13/CREDITS.txt`).

## Output files (all inside `C:/projects/_studio-animatzia/productions/kz_k13/`)
`film_a.html` (DURS = the 29 durations from shots_k13.json, in order; `window.__dur` must equal their sum), `k13lib.js`,
`k13fx.js`, `CREDITS.txt` if any asset is used. Keep STORYBOARD.md, BRIEF.md, shots_k13.json, shot_src_starts.json. Nothing else
(no stills, renders, logs - the whole folder is uploaded to the PUBLIC render repo).

## Look (numbers)
- Palette: slate blue #6B8CAE, snow cream #F7F3EA, terracotta #D9774B, pine green #4E7D6A, mustard #E9B64A (spice only),
  ink outline #2F3440, sky #BFD6EA. Flat toon materials, soft shadows, clean simple backgrounds, bright. Never dark or black
  (the creation void in s03 is deep slate #34465E and brightens within 2 s).
- Must look different from k12 (sage/coral, round wooden glasses) - here the glasses are SLIM, dark-blue frames, rectangular-rounded.
- NO characters at all. The person = a small warm LANTERN (terracotta body, mustard glow). Child = tiny bed + small shoes only.
- Recurring hero objects (build once in k13lib.js, reuse): RING track + glowing BALL (s04-s10), START line (s08, s21), the ROAD to the
  far glowing GATE (an arch of light, s09-s11, s14, s15, s19-s28), the LANTERN (s19-s23, s28), the GLASSES (s25, s28, s_end optional).
- Allowed religious objects: an open book on a stand only (s01, s11, s18). No sefer Torah, tefillin, tallit, idols, crosses.
  s04 column = a plain smooth stone column (no statues, no temples). s26 park: no figures, no music instruments with faces.
- Every shot: camera always moving (dolly/orbit/crane, eased), frame 0 of every shot not empty, the key object visible within 3 s,
  nothing important cut by the frame edge, fill the frame. Transitions: soft dissolves through light, or continuous camera moves
  between related shots (s07->s08 ring breaks, s08->s09 along the road, s19->s20->s21->s22 corridor, s27->s28).
- Each spoken idea = one visible 3D action performed by an object (see storyboard). Time actions inside a shot by its duration
  (e.g. at 0.3*dur), never by absolute film seconds.

## Gates before you report
1. Stills: `cd C:/projects/_studio-animatzia && PYTHONIOENCODING=utf-8 python tools/stills.py productions/kz_k13/film_a.html
   D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/ketzarim/k13_review/stills --times <mid-time of every shot, 29 values>
   --fmt jpg --size 960x540 --timeout 900` (stills go OUTSIDE the production folder), then
   `python tools/safe_view.py <that stills dir> --out D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/ketzarim/k13_review/clean --sheet 4`
   and look ONLY at the files it marks CLEAN. NEVER open a PNG directly. Fix anything empty, cut, dark, unreadable or off-storyboard.
2. `python tools/verify_scene.py productions/kz_k13/film_a.html --out D:/video-projects/kolhalashon-avshalom-schneider/_shorts_tools/ketzarim/k13_review/verify --timeout 900`
   must PASS (zero P0/P1). Batch fixes, then ONE full verify; `--shot <id>` for small re-checks. Copy the PASS report to
   `productions/kz_k13/VERIFY_REPORT.json`.
3. Swiftshader only (no GPU), idle priority. Do NOT render the film, do NOT upload anything, do NOT send mail.
- Python/JSON written with the Write tool only (never heredoc); `rm` only with full absolute paths.
- Do NOT read any Hebrew transcript, caption or *.txt ASR file in ketzarim/ - you do not need them.
- Do not spawn sub-agents unless essential; then one cheap, well-defined agent.

## Report back (short)
Paths of film_a.html and helpers; window.__dur; the CLEAN contact-sheet paths; verify status; one line per shot saying what object
action it shows; any doubt.
