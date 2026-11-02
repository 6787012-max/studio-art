# sod_hazman_v4 - chapter c1 build brief (supervisor, 01/11/2026 night)

Explainer for smart 12-year-old yeshiva boys: "time moves, the sun does not" (winter clock change). Owner verdict on v3:
"animations too low-level, captions pop strangely and are too small, the talking watch looks childish and does not look
like it is talking". v4 is built from zero in high-level 3D. This brief = chapter c1 only (88 s). It is the style pilot
for all 10 chapters, so build the reusable parts as modules.

Read only: this file, `timeline.json` (chapter id c1), `captions_vault.json` (IDs only - never print values),
`C:/Users/<you>/.claude/skills/video-production/references/builder_kit.md` (engine API), and the reference code it points to
(`productions/azamra342/`, `productions/_kit_build/film_demo.html`, `productions/donkey3d/index.html` for a cel-shaded object
with a live canvas face). Output folder: `productions/sod_hazman_v4/` (`c1.html`, `lib_v4/*.js`).

## Hard rules
- ZERO Hebrew in any file you write. Captions only through vault IDs (`C1_L00` ...). NO human characters of any kind
  (no people, silhouettes, hands). Deterministic: everything a function of t (stage3d film contract, `__seek` honours
  `window.__T0||0`). Toon + ink house style, warm cinematic light (key + fill + rim), haze, depth of field.
- Timing comes ONLY from `timeline.json` (lines have t0/t1/end/kind/speaker/words[gold,num]). Never hard-code line times:
  the narration is recorded later and the timeline will be regenerated; the film must follow it automatically.
  Chapter duration = `dur`. A 4 s chapter title card first (vault key `T_C1`).

## Module 1: `lib_v4/caption3d.js` (the owner's main complaint - make it excellent)
- Real 3D captions: each line is drawn to a canvas texture with `ctx.direction='rtl'`, Heebo/Assistant bold, and mapped on
  a plane in the 3D scene IN FRONT of the camera (attach to camera, z about -2.2), with an extruded look: 6-10 stacked
  darker copies offset in depth behind it (bevel feel), soft shadow, slight perspective tilt (rotateX 8-12 deg).
- BIG: cap height ~ 64-72 px at 1920x1080; max 2 lines per caption, ~34 characters per line; bottom band at 80-90% height,
  with a soft dark gradient band behind (not a box).
- Word reveal in RIGHT-TO-LEFT reading order, timed across [t0,t1] proportional to word length: each word rises 18 px
  from depth with a 0.18 s ease-out and fade-in (no blur pop, no jumping, no reflow - the whole line is laid out first,
  words only change opacity/offset). Gold words (`words[i].gold`) are gold (#FFD15A) with a slow light sweep; a word with
  `num` counts up from 0 to its value if it is a pure number.
- Speaker styles: narrator = warm white; watch (`speaker=='watch'`) = italic-feel light gold inside a thought frame
  (rounded dashed outline) on the right side near the watch. Lines stay until `end` (or next line), then fade 0.25 s.
- Cards: kind `S` (did-you-notice) = a small glowing card top-center with an 8 s ring timer during `hold`;
  kind `G` (guess) = big "?" plus 3 s ring; kind `Q` = large centered question card with a 60 s countdown ring (digits
  60->1); kind `A` = answer card with a green check. All cards are 3D panels (thickness, rim light), sliding in on z.
- Expose `caption3d(Wd, cam, chapter)` usable by every chapter.

## Module 2: `lib_v4/watch.js` - the pocket-watch character (an OBJECT with a face; approved house style)
- Antique gold pocket watch, ~cel-shaded, ink outline, crown + bow ring on top, short chain, hinged front LID that opens.
  Its dial is the face: two big expressive eyes with lids and brows drawn live on a canvas texture (like donkey3d),
  the clock hands double as a moustache-like accent (subtle), mouth drawn on the dial.
- It must CLEARLY talk: mouth shapes driven by `talk(t)` 0..1. For now derive talk from the timeline (watch lines between
  t0..t1: a deterministic syllable rhythm ~5 Hz from rng, with pauses at word gaps); later it will read `mouth.json`
  ({lineId:{t0,v:[per-frame 0..1]}}) if that file exists - support both. Add head bob on stressed words, blink every 3-5 s,
  brows up on questions. Dignified and curious, NOT childish: no bouncing, no squeaky cartoon moves.
- API: `makeWatch(Wd, {scale})` -> `{obj, set({talk, lid, brow, look, blink})}`.

## Shot list (c1, follow the timeline line ids; sizes and moves are mandatory, 3 depth layers in every shot)
| line | visual | size / lens | camera move | layers |
|---|---|---|---|---|
| title 0-4 | chapter title card T_C1 floating in a deep blue night, stars | - | slow push | stars / card / haze |
| L00 | Jerusalem stone skyline at night, moon, few warm windows, domes (no crosses), hills behind | WS 28mm, high | crane down 3 m, ease io | stone wall top / houses / hills+moon |
| L01 (V 4 s) | quiet stone street, one lit window; inside, a wall clock reads 01:59 | MS 40mm | push-in to the window | street lamp / window / room |
| L02 | wall clock CU: second hand reaches 12, both hands sweep back 2:00 -> 1:00 | CU 50mm | slow dolly, small shake at the jump | clock / wall / shelf |
| L03 | phone on a table: digits flip 02:00 -> 01:00 alone; oven clock and old alarm clock still 02:0x | MS table top | truck left across the objects | phone / oven + alarm / dark kitchen |
| L04 (V 3 s) | all clocks in the room tick back together, gold whoosh trails | WS room | slow orbit 20 deg | clocks / room / window light |
| L05-L06 | the pocket watch on a wooden table wakes: lid opens, looks at the wall clock, then turns to camera and bows slightly | MCU 50mm, watch 50-60% of frame height | push-in, rack focus from wall clock to watch | sefer stack corner / watch / blurred wall clock |
| L07 | time-lapse: stars wheel, dawn, sun rises over the Jerusalem hills at a marked notch | WS 24mm | static then gentle tilt up | olive branch / city / hills+sun |
| L08 | split stage: left a clock jumping, right the sun gliding on its arc (arc drawn as a gold dashed path) | WS | locked | two halves / arc |
| L09 | watch looks from clock to sun, brows up | MCU | small pan | - |
| L10 | camera rises from Jerusalem through clouds to the whole Earth in space, sun far left | aerial -> space | crane up + pull back, ease io (one long move) | clouds / Earth / sun+stars |
| L11 | an open sefer on a shtender, page glowing warm | CU 60mm | slow push | shtender edge / pages / bokeh |
| L12-L13 | S card over the wall-clock shot replay; answer: 2:00 -> 1:00 fast | MS | locked | - |
| L14 | hook: push-in on the sefer, next chapter title flickers in the light | CU -> ECU | push-in ease-in | - |

## Done =
`c1.html` + modules; `python tools/verify_scene.py productions/sod_hazman_v4/c1.html` PASS (zero P0/P1); a JPG beat sheet
(one still per line id, real 1920x1080 frame, HQ) at `productions/sod_hazman_v4/_stills_c1/`. Report: files, verify lines,
known defects. No full video render (the supervisor renders on the farm). Do not start sub-agents unless essential
(then one cheap, scoped). Close every browser/process you opened; never `taskkill msedge.exe`. Never read PNG files.
