# tractorina_preview: SHOT LIST (English only; Hebrew text comes from captions_vault.json IDs)

Goal: a ~84 s PREVIEW film (film_a.html) showing how the live-action school film will look. Style: approved cartoon OBJECTS with faces (references/cartoon_style.md), 3D/2.5D, cel-shaded, bright colours. NO HUMAN FIGURES AT ALL (hands allowed only as a simple raised hand silhouette in s07). Characters = ATV quad bikes (each with big expressive headlamp eyes, one small cartoon face on the front fender) and ONE luxury silver sedan with a sad/embarrassed face. Mud, rope, whistle, stones, hills near Beit Shemesh (pale limestone, olive trees, dry grass, after-rain puddles).
Palette: warm earth + olive + sky blue; the 4 ATVs have 4 colour bands (red, blue, yellow, green) = 4 wheels. Each shot must hold at least 4 kinds of moving elements (see references/visual_richness.md) and Hebrew text INSIDE the scene (signs / labels / boards) by vault ID plus the bottom caption by vault ID.
Camera: multi-setup (push-in, truck, orbit, crane, insert) per references/cinematography.md. Deterministic function of t (__seek, add window.__T0||0). 1280x720 for the preview, 12 fps capture then interpolate to 24.

| shot | dur | content | vault IDs |
|---|---|---|---|
| s01 | 6 | Desk-top macro: a toy ATV with a muddy wheel; a finger-less nudge (a pencil rolls into frame and taps it); wheels spin, little face blinks; engine rumble ticks. Camera push-in. | CAP_01 |
| s02 | 9 | Wide crane over a muddy dirt road after rain. A glossy silver luxury sedan rolls in slowly and sinks; wheels spin, mud sprays, puddles ripple. A wooden road sign on the left. | CAP_02, LBL_02a |
| s03 | 9 | Close, low angle: sedan rear wheel spinning in a brown crater; the sedan's headlamp-eyes look embarrassed; sweat-drop icon; olive branch sways. Hubcap flicks mud. | CAP_03 |
| s04 | 10 | Four ATVs (red, blue, yellow, green bands) arrive in a diagonal line, dust cloud behind, tires bounce on ruts; they stop with a little hop; four ropes unspool in a fan. Orbit camera. | CAP_04 |
| s05 | 10 | AWARENESS: tight on the ATV with the biggest eyes: eyes dart left/right/down (fast, restless) and lock on a sharp grey stone hidden under the sedan's rear wheel; a small arrow sign with a stone icon pops; slow push-in on the stone as the rope passes over it; the stone is pulled out. | CAP_05, LBL_05a |
| s06 | 10 | RESPONSIBILITY: insert shot of a rope tying itself to the tow bar (rope tip knots), tugged, knot slips; the ATV's face winces, then retries slowly; a tag on the rope reads checked twice. | CAP_06, LBL_06a |
| s07 | 10 | AUTHORITY: four ATVs idle, engines trembling (shake), ropes taut; a single simple raised-hand silhouette on a hill rim (flat black, no face) holding a silver whistle; the ATV with biggest eyes strains but waits; hand drops, whistle glints; all four go. | CAP_07, LBL_07a |
| s08 | 12 | COMMITMENT: three attempts in one wide locked shot with a measure stick in the mud: attempt 1 car moves a little and slides back, attempt 2 more, slides back; three labels pop in order; third: car pops out with a mud-burst. Dust, mud clods, confetti of leaves. | CAP_08, LBL_08a, LBL_08b, LBL_08c |
| s09 | 8 | Victory: the sedan, splattered, drives off; the 4 ATVs line up and rev; tyre tracks in the mud form four circles; title card with the logo sign: a rounded badge (an ATV wheel with a leaf and a book), title via CAP_09, label LBL_09a. | CAP_09, LBL_09a |

Rules: no human figures except the one silhouette hand; no phones; no crosses/other religious symbols; no text except vault IDs; no per-frame grain. Done = film_a.html passes `python tools/verify_scene.py productions/tractorina_preview/film_a.html` with zero P0/P1, stills (JPG only) reviewed by you.
