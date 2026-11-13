# arachin3d / film_e - "before the sun rises" (morning lesson at 05:50). ASCII only.

Fourth film of the same production. Portrait 1080x1920 ONLY. Duration 36.39 s. Silent page; narration exists.
Times: `narration_times.json` key `film_e` (6 lines, a..b seconds).
General rules, palette, materials, text rules: `BRIEF.ids.md` in this folder (sections "Hard rules" and "Look"). They all apply.

## Build from what already works (read, do not edit)
- `fa.js` + `film_a.html`: structure, backdrop, lights, text planes, screen-space titles, timing helpers, the `__caption` override. Copy this skeleton.
- `book3d.js`: `makeBook(THREE,{w,h,t})` with `setOpen(k)`, `setFlip(u)`, `setGlow(g)`. Use it for every book. Do not edit it.
- `fb.js` shot b4: the 33 stepping-stone path, hopping bookmark and running counter. Copy and adapt.
- `fc.js` shot c2: the gold wall clock with hands and a time plate. Copy and adapt.

## The hero of this film is LIGHT
Starts in deep night (navy, stars), ends in full sunrise (warm gold-pink sky, sun disc with rays). The sky colour must change continuously over the film: night until 17 s, first red glow on the horizon 17-25 s, sun rising 25-29 s, bright morning 29 s to end. No people, no silhouettes.

## Shots
| shot | time | what we see | text IDs |
|---|---|---|---|
| e1 | 0-6.4 | Night. Rolling dark hills with a small sleeping village: 8-12 simple houses, all windows dark, stars, crescent moon. Camera cranes down slowly. A large gold clock floats in and its hands settle on 5:50 (hour hand between 5 and 6, minute hand on 10). | E_T550 on the clock plate |
| e2 | 6.4-11.4 | One window in one house turns warm yellow. Camera pushes through that window into a room: wooden table, closed Talmud volume (makeBook), a cup with rising steam (deterministic particles), warm lamp light. | E_CHALON |
| e3 | 11.4-17.35 | Close on the book: it opens (setOpen 0->1), pages flip (setFlip), light comes out (setGlow up to 0.7). A desk calendar leaf flips beside it. | E_MASECHET, then E_YOM, then E_33 |
| e4 | 17.35-25.05 | Outside again: the 33-stone path climbs the hill, glowing bookmark hops, counter runs 1..33, stones light gold. Behind the hill the horizon starts to glow red-orange. A gold name plate slides in under the title. | E_DAF, then E_MAGID (plate, from about 19.5 s) |
| e5 | 25.05-29.1 | Sunrise: the sun disc rises behind the hills with long rays, stars fade, village windows catch light. The gold clock returns and its hands sweep to 6:30. | E_SHACHARIT |
| e6 | 29.1-36.39 | End card over the bright morning sky: the open book in the lower third, sun behind it. Texts punch in one after another; last 1.2 s is a clean hold, no fade to black. | E_T550 (large), E_END1, E_CTA, E_END2 (small, bottom) |

## Requirements
1. Main subject fills 55-65% of frame height in every shot.
2. Text: letter height at least 5.5% of frame height for titles; all text inside the central 80% of the width. Short lines are kinetic 3D or screen-space text, as in fa.js (so the verify caption gate passes).
3. Transitions 0.4 s or shorter, no double exposure of two shots. The push through the window (e1->e2) is a real camera move.
4. Something changes every 1.5-3 s; camera moves all the time.
5. Additive glow halos behind gold objects, the lit window and the sun. Gold under 15% of the frame until the sunrise.
6. Files: `film_e.html`, `fe.js`, stills folder `_stills_e`. Nothing else. No edits under `lib/`, no edits to other films or to book3d.js.

## Done condition
- `python tools/verify_scene.py productions/arachin3d/film_e.html` = PASS, zero P0/P1.
- A portrait JPG sheet of 12 frames (0.5, 3, 5.5, 7.5, 10, 12.5, 15.5, 19, 23, 27, 31, 35.5 s) in `_stills_e`, passed through safe_view, looked at by you: no people, sky changes from night to morning, clock reads 5:50 then 6:30, text readable, no empty frame.
- Report: ASCII, max 8 lines: files, verify result, sheet path, what is weak.
