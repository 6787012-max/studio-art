# oto_pilot - design brief for the Sonnet scene builder (English, zero Hebrew; texts = vault IDs)

Read ONLY: `C:/Users/~/.claude/skills/video-production/references/builder_kit.md` (resolve ~ with os.path.expanduser; never write the Hebrew user name), this file, `BRIEF.ids.md`, `timeline.json` (shot durations `dur` and `capAt` are LOCKED - do not change), `captions_vault.json` keys only.
Copy from: `productions/azamra342/` (road.js, film_b.html) and `productions/_kit_build/film_demo.html` (props, GLB actor, crowd). Output: `productions/oto_pilot/film_a.html` (+ one shared module `oto.js` for look constants).

## What this film is
The GRAPHICS LAYER of a ~3.5 min concept video for Haredi boys aged 12, shown in a school lobby WITHOUT sound. Topic (do not explain it in the scene, the captions do): "a cow and her calf are not slaughtered on the same day". Real animation clips by another publisher are laid ON TOP of this film locally in two shots (s04, s09) - there you build only a quiet backdrop. No narration, no text except vault IDs. 1920x1080, 30 fps. NO `kicker`, NO `recap` in `film({...})` (the 14 shots are the whole film; total length must equal the sum of timeline durations).

## One central metaphor and look
Warm morning farm: green meadow, wooden barn, fence, a calendar hanging on the barn wall. Hero pair = a COW and her CALF (always together, calf close to her flank). Palette: grass 0x7cc35b, sky top 0x8fd3ff to bottom 0xfff1cf, barn red 0xc8553d, wood 0xb9854f, gold accent 0xf2b632 (spice only), outline ink 0x2a2018 width 0.03. Toon + ink house style; sun from upper left, warm. Characters: ONE boy (kid student, kippa, `scale .72`, look = BOY constant in oto.js, copy from azamra342/road.js) used in question shots and the summary. Men and boys only; no ritual objects.
Cow/calf: use `assets_net/Cow.glb` (and a calf if present) via `lib/glb3d.js` if the file exists (check; a downloader may still be running - if absent after you finish the others, build a toon cow from `box/ball/cyl` + ink, calf = same at scale .55). Gestures/clips sampled by time only.

## Shots (ids, durations come from timeline.json)
Every shot: opaque ground (no white flash), a camera that moves the whole time (dolly/crane/orbit/pushIn from lib/motion3d.js), one idea, frame 0 not empty, hero >= 40% frame height in its key moment, big readable `label` signs for LBL_* (canvasTex, high contrast, no more than 8 words per sign, font >= 96 px at 1080p; the engine rtl-enforces vault text).
- s01 title (LBL_TITLE big gold-edged wooden sign on two posts, LBL_TITLE_SUB smaller sign below): cow and calf walk side by side toward camera across the meadow, camera low pushes in; they stop at the sign.
- s02 concept card (LBL_S02_KICK small sign top, LBL_S02_SUB sign on barn wall): cow and calf stand together in the sunny yard; a big translucent gold "one day" sun disc (props3d sunDisc) rises over them while the camera cranes up; hero = pair.
- s03 verse (LBL_S03_REF on a scroll prop / signboard): slow orbit around an open scroll standing on a stone stand with the cow and calf blurred-small behind; quiet, warm; a bird flock crosses.
- s04 BACKDROP for a clip (clip covers x 240-1680, y 14-824 of the 1920x1080 frame; captions live in the zone y 842-1026): dusk-blue meadow and barn far away, small fireflies (deterministic), camera drifts very slowly; keep the area outside the clip rectangle pleasant (cow silhouette at far left edge, calf at far right edge, both small). `Wd.hero` = the barn.
- s05/s06/s07 questions (LBL_Sxx_ANS = a green sign that appears ONLY when the answer caption starts, at capAt[1]): the boy stands in the yard with a "think" gesture while a big round clock (s05, rotating hand = the think countdown for the first capAt[1] seconds), a calendar page flipping from "today" to "tomorrow" (s06), and a cow/calf pair where the calf walks first then the cow (s07) play behind him; at capAt[1] the camera pushes in and the boy does `up`/`thumb`; sign pops in (ease out).
- s08 card (LBL_S08_KICK, LBL_S08_SUB): cow and calf at the center, a bull stands slightly apart at the far fence, the camera pans from the bull to the pair and rests on the pair (the bull is the "father": same cow GLB scaled 1.25 and tinted dark, or toon).
- s09 BACKDROP for a clip (same geometry rule as s04), but a calm morning version of the barn yard.
- s10 card (LBL_S10_KICK, LBL_S10_SUB): a market scene, boy-seller figure (man look, not the kid) leads the cow by a rope toward a buyer figure (man), sign posts with LBL_S10_KICK; camera tracks sideways.
- s11 quote (LBL_S11_REF): the scroll again (reuse the s03 prop builder) but sunset light; slow crane up; calendar with four marked pages fans out.
- s12 card (LBL_S12_KICK, LBL_S12_SUB): a village lane filling with several cows/men moving toward the barn (crowd n <= 10, lite figures), camera high crane; calendar on the barn wall shows festival marks (no text except the vault labels).
- s13 summary (LBL_SUMMARY sign; 5 captions, one per ~5.3 s): the boy stands beside the cow/calf; five numbered stone steps or five hanging lanterns light up one by one in step with capAt (read capAt from timeline.json); camera orbits slowly; every lantern lights exactly when its caption appears.
- s14 credits (2 captions, plain): the yard at golden hour, cow and calf resting under a tree, slow pull back; no new props.

## Rules for this production
- Deterministic scenes (function of t only), HQ mode untouched, no Math.random (use rng(seed)). Zero Hebrew in html/js; only vault IDs. Gestures only from the working list in builder_kit.md.
- Caption zone is fixed by the engine (y 842-1026): keep scene content readable above y 842 in s04/s09 outside the clip rectangle and in the other shots keep the hero clear of the caption zone.
- Seams: exit direction of shot N = entry of shot N+1 (camera travels left-to-right in odd shots, right-to-left in even, or fade through the sun glare); at most 1/3 hard cuts.
- Budget the work: first build ONLY s01 + s05 and run verify with `--shot s01`, then the rest. One verify command: `python tools/verify_scene.py productions/oto_pilot/film_a.html [--shot <id>]` (needs PASS: zero P0/P1). Stills sheets are JPG; never Read a PNG; no full renders.
- Report: files, verify lines, known defects, shot-by-shot one-line description. No Hebrew in the report.

## BANNED (grows after each render)
(empty so far)
