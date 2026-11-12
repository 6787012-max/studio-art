# arachin3d - three short 3D promo films (ASCII only; all on-screen text = vault IDs)

Goal: three promo films that make people want to join a daily Talmud lesson (new tractate starts).
Audience: adults, shown in WhatsApp. PRIMARY format = portrait 1080x1920. Second format = landscape 1920x1080.
Narration already exists as audio; picture must hit the times in `narration_times.json` (line a..b seconds). Films are silent pages.
Bar set by the client: "crazy 3D production, attractive, interesting, captivating". Real film, not slides.

## Hard rules
- NO human characters in any form: no faces, bodies, silhouettes, hands. Only objects, architecture, light, numbers, text.
- No Hebrew in any file you write. Text on screen only through `captions_vault.json` IDs (load the json, put the string in a texture/DOM by ID). Never print or echo the vault values.
- Never Read a PNG. Stills = JPG through `python C:/projects/_studio-animatzia/tools/safe_view.py`.
- Deterministic: the scene is a pure function of t. Contract: `window.__ready`, `window.__seek(t)` (must add `window.__T0||0`), `window.__dur`. Copy the contract and render setup from a FINISHED production: `productions/stef_41/` (film_a.html, lh.js, lh_base.js, render.json). Engine: `lib/stage3d.js`, `lib/motion3d.js`, `lib/props3d.js`. Read `~/.claude/skills/video-production/references/builder_kit.md` and `cinematography.md` first.
- Do not edit shared files under `lib/`. Put everything in `productions/arachin3d/`.
- Do not spawn sub-agents. Do not send any message or mail. Kill only your own PIDs. No GPU. Do not run a full local render; stills only.
- Max ~60 tool calls, then stop and report.

## Look (numbers)
- Palette: deep navy #0B1B3A background space, royal blue #1F4FA8, gold #D9A93C, light gold #F3D98B, cream #F6F1E5 for text. Gold = accent, under 15% of frame.
- Materials: physical/standard materials with metalness on gold (0.9, roughness 0.25), soft key light warm (#FFE2A8) from upper left, cool rim (#6FA8FF) from back right, floor with soft reflection or contact shadows, light fog for depth, floating dust/bokeh particles (deterministic positions).
- Every shot: camera moves the whole time (push, orbit, crane, truck), 3 depth layers (foreground element, subject, background), something changes every 1.5-3 s.
- Text: big, bold, cream or gold, RTL Hebrew via vault, appears exactly with its narration line, kinetic entrance (scale punch 0.8->1 with ease-out, 0.35 s). Keep text inside the central 80% of the portrait frame. Minimum text height: 5% of frame height.
- Transitions between shots: match-move or whip/flash, at most 1/3 hard cuts. No white flash frames, no empty black frames.
- Format switch: `?fmt=portrait` (default) = 1080x1920, `?fmt=land` = 1920x1080. Same 3D scene; adjust only camera distance/FOV and text layout by aspect. Key action stays in the centre.

## film_a (39.74 s) - "how much is a person worth" - file film_a.html
Lines from narration_times.json film_a.
| shot | time | what we see | text IDs |
|---|---|---|---|
| a1 | 0-3.6 | Dark blue space. A huge gold 3D question mark spins up from below, camera pushes in fast, dust sparks. A gold balance scale rises behind it. | A_TITLE |
| a2 | 3.6-13.9 | Market valuation machine: balance scale centre; three round 3D gauges (dials with needles) float in an arc, labelled; needles swing up and down and a coin stack on the scale pan grows and shrinks with them; a price tag flips digits. Camera orbits 60 degrees. | A_DAMAI at line1.a, then A_SHUK, gauges labelled A_GIL A_BRIUT A_KOACH |
| a3 | 13.9-21.1 | A scroll unrolls across the frame; a stone slab with an engraved fixed coin stack lands with weight (dust ring); a gold seal stamps it. Two of the three gauges turn grey and drop away, only the first stays lit. Crane up. | A_ERKI at line2.a, then A_KAVUA |
| a4 | 21.1-27.0 | Two candles on two pedestals: one weak flickering small flame, one strong bright flame. An identical gold coin stack rises in front of each. They sit on one big balance scale that settles perfectly level. Truck sideways. | A_SHAVIM |
| a5 | 27.0-33.4 | The remaining gauge and the price tag crumble into dust. A single large glowing cut gem rises in the centre, light rays, slow push in, particles orbit it. | A_MESER |
| a6 | 33.4-39.74 | A thick 3D Talmud volume (navy cover, gold tooling) lands and opens, pages flip, light comes from the pages. A desk-calendar leaf flips to show the day. End card holds 1.2 s. | A_MASECHET, A_YOM, A_CTA |

## film_b (22.05 s) - "33 pages only" - file film_b.html
| shot | time | what we see | text IDs |
|---|---|---|---|
| b1 | 0-5.3 | A big open Talmud volume on a stand; last page turns, the cover closes with a heavy thud, gold confetti and sparks burst, camera pulls back. | B_REVII, B_SIYUM |
| b2 | 5.3-9.1 | A new volume slides in beside it on a bookshelf of many volumes, pops forward, opens; warm light bursts from inside. Whip transition in. | B_CHAMISHI, B_HATCHALA |
| b3 | 9.1-11.7 | Giant extruded 3D number built out of stacked pages slams down, camera punch-in, shockwave ring. | B_33, B_DAPIM |
| b4 | 11.7-17.6 | A winding path of 33 page-shaped stepping stones climbs a hill to a summit with a gold flag. A glowing gold bookmark hops stone to stone; each stone lights when touched; a counter runs 1..33. Camera flies along the path low and fast then rises. | B_DAF |
| b5 | 17.6-22.05 | Summit: the volume on a stand, light beam up, flag waving, orbit and settle on end card (1.2 s hold). | B_MECHAKE, B_CTA |

## film_c (25.49 s) - "your chance to join" - file film_c.html
| shot | time | what we see | text IDs |
|---|---|---|---|
| c1 | 0-6.2 | A tall double door in a dark blue hall; a line of gold light under it; the doors swing open, light floods out, camera flies through. | C_HIZDAMNUT |
| c2 | 6.2-12.3 | Two big 3D wall clocks with gold rims; hands sweep fast and stop: first at 7:15, second at 8:30 (evening). Digital time plates pop under each. Orbit between them. | C_SHNEI, C_T1, C_T2 |
| c3 | 12.3-14.6 | Night sky: crescent moon and stars rise over a study-hall building with warm lit windows (building only, nobody visible). | C_ARVIT |
| c4 | 14.6-19.2 | A weekly calendar grid in 3D; a small gold clock stamps the same hour on each day one after another (thump, ring ripple), the row locks with a gold pin. Truck along the row. | C_KAVUA |
| c5 | 19.2-25.49 | A large hourglass, sand streaming, it flips with weight; text punches in two beats; end card holds 1.2 s with MASECHET + DAF_YOMI. | C_EIMATAI, C_CTA, MASECHET, DAF_YOMI |

## Done condition per film
1. `film_X.html` (+ its js) in `productions/arachin3d/`, loads with zero console errors in both formats.
2. `python tools/verify_scene.py productions/arachin3d/film_X.html` = PASS (zero P0/P1). If the tool cannot handle the portrait size, say so and report its landscape result.
3. A beat sheet of JPG stills, one per shot, in BOTH formats, checked through safe_view; you looked at the CLEAN ones and confirm: no people, text readable and not clipped, no empty/black frame, camera differs between consecutive stills.
4. `render.json` for this production lists every include the page needs (copy from stef_41, drop what is unused).
5. Final report: ASCII, max 10 lines: files, verify result, what is weak, what is open.
