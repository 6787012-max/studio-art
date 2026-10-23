# ks65_3d - PILOT: vertical 3D background for a YouTube Short (series "kol halashon")

Goal: the FIRST vertical short built in the stage3d engine. It replaces the 2D canvas background of an existing,
already-verified short (short65). Audio (a recorded lecture) and karaoke captions are added LOCALLY afterwards
with ffmpeg - this film has NO captions, NO title, NO narration, NO on-screen text of any kind.

## Format (hard)
- Canvas 1080 x 1920 (portrait). `<canvas id="c" width="1080" height="1920">` and `film({W:1080, H:1920, ...})`.
- Exact length 59.07 s (sum of shot durations). 30 fps is set by the render tool.
- Safe zones (captions are burned in later): top band y 0-470 px will carry short key phrases; bottom band
  y 1430-1920 carries karaoke captions. Keep faces, hands, the arrow, the gift and the flowers inside
  y 470-1430 (the middle ~50% of the frame). Background (sky, ground, buildings) may fill everything.
- No caption/title/kicker/recap UI from the engine (pass empty / omit). If verify_scene complains only about
  missing captions, report it - the supervisor accepts that one.

## Look (numbers)
- Palette: sky top #1e1814 (charcoal), sky bottom #5a3a26, fog #2a201a, ember orange #ff7a2f, gold #ffb347,
  cream #fff3e0, warm ash #7d7268. Toon + ink outline house style (no PBR). Warm, soft, NOT metallic.
- Light: warm low sun from screen-left, colour #ffb070; hemi sky #ffd8b0 / ground #3a2a20.
- World: an evening stone courtyard / narrow street of an old town (stone ground, 2-3 simple house blocks with
  lit windows, a doorway, a bench). Same world all film; camera and light tell the story.
- Characters (men only, adult, kippa, beard, dark suits): A = "the one who curses" (coat #3a2a24, dark beard);
  B = "the hero" (coat #7a4a2a, greying beard #7d6a5a). Both BIG on screen (each >= 30% of frame height in
  medium shots). Same look constants for both in one shared object.
- Banned: any text/letters, women/girls, crosses/churches/mosques, Math.random, PBR, empty frames, tiny figures.

## Shots (times are film seconds; the lecture audio is already locked to these times)
| id | t0-t1 | intent (one sentence) | characters + gestures | props | camera |
|---|---|---|---|---|---|
| s1 | 0.00-14.60 | Someone hurts you: A points at B, an orange arrow flies from A to B and hits. | A: point+talk (0-12), B: rest -> shrug at 5.5 (arrow hits) -> think 9-14.6 | thick orange arrow (cyl shaft + cone head, emissive-ish #ff7a2f) flies A->B 0.5-5.5, stays stuck near B | start medium-wide two-shot at 3/4 angle, slow push-in (io) 0-14.6; small camShake at 5.5 |
| s2 | 14.60-21.80 | The outer reaction: B fires the arrow back; then a gold beam of light comes down from the sky. | B: point (14.6-16.5) angry brow; A: shrug when hit 16.0; both look up at 17-21.8 | second arrow B->A 14.6-16.0; gold light cone from high above (transparent cyl, #ffb347, grows 16-21) touching both men | crane up and back (io) 16-21.8, sky source enters top of frame |
| s3 | 21.80-28.90 | The inner truth: Heaven sent A - a gold thread runs from the sky light to A's hand; A is a messenger. | A: up (palms up, looking up) 22-28.9; B: think, watching A | gold thread (thin glowing cyl/line) sky -> A hand, draws on 21.8-24; arrows fade out 27-28.5 | low angle looking up past A to the light (fov 45), slow orbit 15 deg |
| s4 | 28.90-37.20 | Everything flips: the camera orbits 180 deg around the two men; B now sees A as his best friend. | B: wide (open arms) toward A at 34.7-37.2, smile from 33.2; A: rest | warm halo (gold, additive sprite) around A 33-35 | orbit 180 deg around the pair 29.2-33.0 (io), camShake at 33.1 (0.5 s), settle medium on B's face+A |
| s5 | 37.20-53.40 | B gives a gift to the one who insulted him: box opens, flowers rise; A is enriched. | B: offer (37.2-50) holding the box toward A; A: surprised brow 41-44, smile 46+, heart 48-53 | orange gift box with gold ribbon (box), lid opens 40.5-43.5; 5-7 cream/peach flowers (ball petals + gold centre) rise out 46.5-52.5; gold sparkles rise from A 47.5-50 | slow lateral dolly left->right (io) 37.2-53.4, slight push-in |
| s6 | 53.40-59.07 | "Yasher koach": B thanks A; gold dust falls over B (he feels cleansed); end on an inner warm glow. | B: thumb 54.2-55.9, then pray (hands together, calm) 56-59; A: smile | gold dust particles falling over B 54.8-57 (rng(seed) positions, function of t); warm glow sprite grows on B's chest 57-58.6 | push-in to B's head+chest 53.4-58.4; from 58.4 to 59.07 fade the whole frame to charcoal #120c09 (the next clip starts dark) |

Seams: s1->s2 continuous (same camera move, no cut). s2->s3 match cut on the light. s3->s4 continuous orbit.
s4->s5 soft cut. s5->s6 continuous push-in. Frame 0 must already show both men and the courtyard (no empty frame).

## Deliverable (builder)
`productions/ks65_3d/film_a.html` (+ optional `ks65lib.js`), verify PASS with `python tools/verify_scene.py productions/ks65_3d/film_a.html`.
Report: verify result lines, sheet JPG paths, known defects. No renders.
