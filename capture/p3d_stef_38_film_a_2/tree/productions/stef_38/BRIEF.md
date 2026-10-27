# stef_38 - "Combining witnesses" (tziruf edim) - 3D graphics layer for a concept video

## What this film is
A 321.48 s silent 3D picture (1920x1080, 30 fps) that becomes the GRAPHICS LAYER of a lesson video. Later, locally, seven
animation clips of another studio are laid OVER the clip shots (s05, s07, s09, s10, s14, s15, s17; rectangle x160-1760,
y20-920, times in `shots.ids.md`) and music is mixed in. Nothing of those clips is in this folder or in this code. The
video plays in a school lobby WITHOUT SOUND: every shot must explain its idea by what the objects DO; the caption (vault
ID) is the words.

Topic (English only, for you): Torah law needs TWO witnesses (Deut 17:6) plus a WARNING given before the deed (the one who
warns = "matre", the warner). Mishna Makot 6b: two witnesses watch from one window, two from another window, and a warner
stands in the middle. If (some of) the two groups SEE EACH OTHER they combine into ONE testimony; if not, they are TWO
separate testimonies. The Gemara adds: if they all see the WARNER in the middle, the warner joins them into one. "Edut
meyuchedet" = each witness saw alone, from a different place, without seeing the other witness. Why it matters: if one
group is proven false witnesses (zomemim), and the groups are two separate testimonies, the other honest group still
stands - the offender is punished on the honest group's word, the false group is punished for lying, and the honest group
is exempt.

Read: `~/.claude/skills/video-production/references/builder_kit.md` (engine rules), this file, `timeline.json` (locked
shot durations + capAt) and `shots.ids.md` (shot table). Closest finished example: `productions/stef_37/` (`BRIEF.md`,
`film_a.html`, `mk.js`, `render.json`) - it already has the COURT (three empty chairs on a dais), the WITNESS POSTS (stone
posts with an eye-lens disc), the WARNING BELL, red-bar / green-check billboards, the clock-ring question pattern and the
clip-hold backdrop. COPY stef_37's page structure and reuse its builders, then build the new objects. Write
`productions/stef_38/film_a.html` and a shared module `productions/stef_38/wt.js`; copy `stef_37/render.json` to
`stef_38/render.json` (includes: wt.js instead of mk.js, plus any assets you use).

## Hard technical contract
- `film({title:'TITLE', kicker:'KICKER', vault:'captions_vault.json', shots:[...]})` - NO recap, so `__dur` must equal
  exactly 321.48 (sum of timeline.json shot durations). Shots s01..s22 in order, each `dur` = timeline.json value, `caps` =
  caption IDs of that shot in order, `capAt` = timeline.json capAt of that shot. s01 has no caps (title overlays 0-4.2 s).
- Captions sit in the bottom band (about y 0.78H-0.95H). Keep every key action in the upper 75% of the frame.
- Deterministic (function of t only), toon + ink house style, `Wd.hero = <main object>` in every shot.
- NO people, no hands, no knife, no weapon, no body, no violence. The deed is an abstract RED DEED TOKEN. Actions are
  done by objects themselves (beams light, rings close, posts glow, things slide/float/pop). Text in 3D: none, except
  ASCII digits (1, 2). Symbols instead of words.

## Visual codes (keep constant in all shots)
- WINDOW = a small cream house-wall section with ONE square window frame (dark-wood frame, sky-blue glass pane); two
  WINDOWS stand left and right of the stage, angled in toward the middle, about 6-8 units apart.
- WITNESS = stef_37's stone post with an eye-lens disc on top. A GROUP = two posts side by side behind a window. LEFT group
  lenses tint pink-violet (#C77DD8), RIGHT group lenses tint sky-blue (#4FA8E0) (same colours as the clips' beams).
- DEED TOKEN = a glossy deep-red rounded cube (#C2453A) on a small round stone plinth in the middle, with a slow pulsing
  red ring on the floor around it ("something forbidden is happening here").
- WARNER = stef_37's bell on a slim post standing just in front of the deed token; when it warns it swings and emits gold
  rings of light.
- SIGHT LINE = a thin glowing beam (tube or stretched quad, additive, slightly animated shimmer) from a lens to its target.
  Left group beams pink-violet, right group beams sky-blue. A beam "draws" from lens to target over ~0.6 s.
- ONE TESTIMONY = a single gold ring (torus, flat on the floor) expands to encircle BOTH groups, digit "1" rises above.
- TWO TESTIMONIES = two separate rings, one under each group (pink one, blue one), digit "2" above, a soft gap between.
- LINK = a gold beam directly between the two groups (they see each other) - or, for the warner case, both groups' beams
  go to the BELL and the bell glows gold and sends a gold ring outward that joins both groups.
- COURT = stef_37's three empty high-back chairs on a dais, warm lamp.
- FALSE (zomemim) = a group's posts turn dull grey, lens cracks (dark line), red bar billboard above them.
  HONEST = green check billboard. "Exempt" = the honest group's ring turns soft green and the posts relax (gentle bob).
- SCROLL = a parchment roller (no text) for the verse.

## Art direction (owner order 26/10/2026)
Clean bright flat-explainer look rendered in 3D: soft toon materials, 4-5 colours per shot, lots of clean space, simple
backdrop, smooth motion, gentle camera moves, real depth (foreground edge / mid stage / soft far backdrop, parallax).
Palette: backdrop #E9E2D3 (warm parchment), stone #D8C9A8, dark wood #6B4A32, wall cream #F3EBD3, red #C2453A,
green #4FA35A, gold #E8B830, pink-violet #C77DD8, sky-blue #4FA8E0. Warm near-white key light. Every shot moves;
frame 0 never empty; hero visible within 3 s.

## The central visual idea
SIGHT LINES. Two windows, two pairs of eye-lens posts, one red deed token, a bell in the middle. The whole film is about
which beams connect to what: beams that link the groups (or meet at the bell) close ONE gold ring; beams that never meet
leave TWO separate rings.

## STORYBOARD (time = local seconds inside the shot)
| shot | dur | idea (caption IDs) | what the OBJECTS do + camera | character | viewer learns |
|---|---|---|---|---|---|
| s01 | 7.65 | title | Wide stage: two windows left/right, empty posts behind them, red deed token pulsing in the middle, bell beside it; lenses blink on one by one. Camera: slow crane down. | none | subject: witnesses watching from windows |
| s02 | 10.65 | verse: by two or three witnesses (CAP_s02_1) | Parchment scroll unrolls in the back; in front ONE post alone rises - stays dim, a red bar flickers over it; then a SECOND post rises beside it, both lenses light, green check. Camera: slow push-in. | none | one witness is not enough; two are needed |
| s03 | 16.39 | court needs two witnesses + warning (CAP_s03_1, _2) | Two posts and the bell glide toward the court on the dais; at 2nd caption the bell swings and rings gold rings toward the deed token BEFORE the token pulses red (warning comes first), court lamp brightens. Camera: lateral truck to the court. | none | two witnesses + a warner |
| s04 | 18.55 | question: each saw from a different window? (CAP_s04_1, _2) | One post walks (slides) behind the LEFT window, the other behind the RIGHT window; each draws its beam to the deed token; a big floating "?" made of two arcs is NOT allowed (no symbols that read as text) - instead the two beams pulse alternately and a faint gold ring tries to close around both and flickers undecided. Camera: slow orbit 20 deg. | none | is it one testimony or two? |
| s05 | 25.55 | CLIP HOLD (CAP_s05_1.._3) | Calm warm backdrop (soft parchment, drifting light motes, slow parallax at far edges). Nothing important in centre. Camera almost still. | none | (clip: neighbours peek through fence) |
| s06 | 18.01 | edut meyuchedet: each saw alone (CAP_s06_1, _2) | Single post behind each window; each draws its beam to the token; a tall opaque wall slides up BETWEEN the two windows so the posts cannot see each other; at 2nd caption the camera rises to show the wall blocking - two separate small rings under each post. Camera: crane up. | none | each witness saw alone |
| s07 | 11.35 | CLIP HOLD (CAP_s07_1, _2) | Same calm backdrop (reuse). | none | (clip: one on island, one on ship) |
| s08 | 12.07 | the mishna: two windows, warner in the middle (CAP_s08_1, _2) | Full setup builds: left window with TWO posts (pink), right window with TWO posts (blue), deed token, bell in the middle; at 2nd caption the bell swings (gold rings). Camera: wide slow truck left to right. | none | the mishna's scene |
| s09 | 11.35 | CLIP HOLD (CAP_s09_1, _2) | Same calm backdrop (reuse). | none | (clip: yacht, killer, warner) |
| s10 | 11.35 | CLIP HOLD (CAP_s10_1) | Same calm backdrop (reuse). | none | (clip: two groups) |
| s11 | 13.15 | they see each other = ONE testimony (CAP_s11_1, _2) | Both groups beam to the token; then a gold beam draws directly from a left lens to a right lens (they see each other); at 2nd caption one big gold ring expands around all four posts and digit "1" rises. Camera: slow push-in from front-high. | none | seeing each other -> one testimony |
| s12 | 12.07 | they don't see each other = TWO testimonies (CAP_s12_1, _2) | Same setup, the blocking wall slides up between the groups; the gold link beam is cut; at 2nd caption two separate rings (pink, blue) appear, digit "2". Camera: slow orbit opposite direction to s11. | none | not seeing -> two testimonies |
| s13 | 16.93 | the warner joins them (CAP_s13_1, _2) | Wall stays between the groups; at 1st caption both groups' beams swing from the token to the BELL; at 2nd caption the bell glows gold and sends a gold ring outward that passes over the wall and closes ONE ring around both groups, digit "1" replaces "2". Camera: slow crane over the wall. | none | the warner in the middle combines them |
| s14 | 11.35 | CLIP HOLD (CAP_s14_1) | Same calm backdrop (reuse). | none | (clip: witnesses see the warner) |
| s15 | 11.35 | CLIP HOLD (CAP_s15_1) | Same calm backdrop (reuse). | none | (clip: witnesses see killer and warner) |
| s16 | 13.15 | why it matters: false witnesses (CAP_s16_1, _2) | Two separate rings (pink, blue groups, digit "2"); at 2nd caption the RIGHT (blue) group turns dull grey, lens cracks, red bar above it. Camera: slow push-in to the right group. | none | one group may turn out false |
| s17 | 11.35 | CLIP HOLD (CAP_s17_1) | Same calm backdrop (reuse). | none | (clip: false group, honest group) |
| s18 | 16.39 | he and they are punished, other exempt (CAP_s18_1, _2) | Court in the back; the LEFT honest group keeps a bright beam to the deed token, green check above it; the court lamp beams onto the deed token (red seal stamps onto it, a red ring pulses) - the offender is judged by the honest group; at 2nd caption the court also stamps a red seal on the false grey group, and the honest group's ring turns soft green (exempt). Camera: slow wide truck. | none | offender judged by honest group; liars punished; honest exempt |
| s19 | 23.86 | QUESTION 1 (CAP_s19_1; think 8.5-14.5; CAP_s19_2 answer) | Two windows with the wall between, two separate rings, clock ring fills 8.5-14.5 above; answer: both beams swing to the bell, gold ring joins them, digit "1". Camera: slow drift. | none | the warner can join them |
| s20 | 23.27 | QUESTION 2 (CAP_s20_1; think 5.7-11.7; CAP_s20_2 answer) | Two separate rings + digit "2", clock ring 5.7-11.7; answer: blue group goes grey with red bar, pink group still beams to the token with green check. Camera: high 3/4 drift. | none | separate testimony keeps the honest group standing |
| s21 | 18.25 | SUMMARY (CAP_s21_1 / _2) | One continuous glide: two posts with green check -> groups linked by gold beam with one ring "1" -> wall and two rings "2" -> bell joining them with gold ring. | none | recap |
| s22 | 7.45 | credits (CAP_s22_1) | Calm wide: the two windows in soft evening light, lenses dim, one gold ring on the floor glowing softly, light motes. | none | end |

## Done condition
`python tools/verify_scene.py productions/stef_38/film_a.html --out productions/stef_38/_verify --timeout 900` = PASS (zero
P0/P1), report copied to `productions/stef_38/VERIFY_REPORT.json`. Batch fixes, one full verify. Also render stills (JPG) at
absolute times 4,14,28,44,88,115,150,162,178,215,240,262,285,305,318 with
`PYTHONIOENCODING=utf-8 python tools/stills.py productions/stef_38/film_a.html productions/stef_38/_stills --times 4,14,28,44,88,115,150,162,178,215,240,262,285,305,318 --fmt jpg --size 960x540 --timeout 900`
for the supervisor. No full render. NEVER Read a PNG (use `python tools/safe_view.py <dir> --out <dir2> --sheet 4` and read
only CLEAN jpgs if you must look). Never put Hebrew in code or chat; captions only as vault IDs.
