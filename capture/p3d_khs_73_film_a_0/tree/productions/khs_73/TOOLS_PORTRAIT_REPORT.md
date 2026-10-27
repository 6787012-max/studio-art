# Portrait (1080x1920) tools report - 23/10/2026 (suffix .bak-20261023b on every edited file)

## Changes
- lib/stage3d.js: capLayout (~l.354, new portrait branch: box <= .86W, font .062W, falls back to .05W when > 4 lines, bottom edge .80H, centered rtl; landscape branch unchanged, now also returns tp/r which equal the old constants); caption() uses tp/r; titleCard (kicker/title sized from W and shrunk to .9W in portrait); recapCard (portrait branch: W-based sizes, rows wrapped to 2 lines); debugOverlay (portrait caption zone .07W..,.56H-.80H); film badge (unit u = W*9/16 in portrait, = H in landscape); __sceneHash samples 108x192 in portrait. __caption rect format unchanged.
- tools/verify_scene.py: --size default None -> auto from the page canvas (1280x720 landscape, 1080x1920 portrait; set_viewport_size after load); P2 SIZE_ASPECT_MISMATCH if --size orientation differs from canvas; pixel sample 108x192 for portrait (PX_SHAPE); CAPTION_TOO_SMALL: portrait < 6% of H, landscape < 8% unchanged; new P1 CAPTION_IN_PHONE_UI (portrait caption bottom > 82% H); safe box 4%/4.5% of the actual canvas (already so); sheets: phone sheet 390 px wide x 693 per frame (8 per sheet), beat sheet 5 cols x 320, seam sheet 8 cols x 200.
- tools/check.py: open_film size=None -> auto_size() (portrait aware); --size default None.
- tools/review_sheet.py: --size default None (auto); portrait sheet layouts (beat 4x320, seams 6x240, phone 4x390).
- tools/stills.py: --size default None (landscape 1920x1080 unchanged, portrait = canvas size); new --fmt png|jpg (default png).
- tools/capture.py: --size default None (landscape 1280x720 unchanged; portrait = canvas size).
- tools/capture_remote.py: new --size; default read from the scene html (film W/H or <canvas>), written to job.json "size" (it was never sent before, so the remote always used 1920x1080).
- C:/projects/studio-art/capture_job.py (remote runner): email copy scaled 720x1280 when portrait. NOTE: it takes effect only when pushed; capture_remote does git add -A + push in that repo at the next dispatch, so it will go up automatically.
- tools/render_all.py: film_size() reads canvas size; passed to capture_remote via --size; PLAN line prints the canvas. Length probe (640x360 viewport) left as is: __dur does not depend on the viewport.
- tools/safe_view.py: portrait images resized to long edge 1280 (landscape still width 1280); folders also pick up *.jpg.

## 16:9 assumptions found
Fixed: capLayout; debug safe zone; title card sizes (H*.105 title would overflow 1080); recap card; film badge; __sceneHash 192x108; verify_scene pixel sample 192x108 + 1280x720 default viewport + 8% threshold + sheets; check/review_sheet default viewport; stills/capture defaults; capture_remote never sending size; remote email 1280x720; safe_view upscaling by width.
NOT fixed (supervisor/builders must know):
1. Camera fov is VERTICAL (three.js): fov 45 in 1080x1920 gives a horizontal fov of only ~25 degrees - shots must use a larger fov (about 60-75) or a farther camera; existing camera helpers/props were composed for 16:9.
2. tools/check.py grab() squashes any frame to 192x108 for its statistics (distorted for portrait, harmless).
3. tools/assemble.py (azamra) and render_remote.py/job_remote.py still hard-code 1920x1080 / 1080p - not used by render_all; copy-and-adapt if a portrait film goes through them (final encode for Shorts: scale to 1080x1920 is already native, so just do not crop to 16:9).
4. Film badge (top-right) sits inside the Shorts top UI band; use cfg.title=null if not wanted.
5. Title card is a single line (shrunk, not wrapped); long titles get small.
6. __caption() in a remote part page uses the page CSS size (viewport = canvas native), fine.

## Tests
- test_engine.py: ALL PASS before and after.
- Probe page productions/kh_short60/_portrait_probe.html (6 s, 1 man, 2 captions) at 1080x1920 (auto-picked): verify_scene -> only P1 CAPTION_SHORT (expected, 2.3 s windows in the 6 s probe); no TOO_SMALL / OFF_SAFE / IN_PHONE_UI. Caption rects: short = 462x131 at y=1405 (bottom 1536 = 0.80H); long = 911 wide (<= 0.86W=929), 4 lines at font .05W, bottom 1536. Hero heightFrac .29.
- Phone sheet 1560x693 (4 x 390x693); stills JPG 1080x1920 viewed through safe_view (CLEAN): captions, debug zones, title dim look right.
- render_all --dry-run film_a (real film_a.html exists now): PASS gate, canvas 1080x1920 in the plan, nothing dispatched.

## Supervisor decisions
- Whether to push studio-art capture_job.py now (otherwise it goes with the first real dispatch).
- Portrait fov convention for builders (see item 1).
