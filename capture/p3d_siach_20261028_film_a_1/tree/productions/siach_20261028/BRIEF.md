# siach_20261028 - BRIEF (supervisor, 01/11/2026)

A 3D cel-shaded cartoon film (16:9, 1920x1080, 30 fps) that ILLUSTRATES a 4-minute recorded morning talk in the
study hall of a yeshiva prep school (the speaker's real voice is the narrator; it is mixed in LOCALLY later - the page
has NO audio and NO captions; captions and the title are burned in later by the supervisor).
Characters act and react; NOBODY lip-syncs the speaker. Theme: THE BINDING OF ISAAC (Akeida) AS THE PEAK OF HONOURING
PARENTS. Isaac was a grown, strong man of 37 and went willingly; he even asked his father to tie him well. The lesson for
the boys: honour your parents in small daily things, even when it goes against what you feel like.

## Method (approved look - copy, never start from zero)
- This folder is ALREADY a copy of `productions/siach_20261030/` (film_a.html, film.js, film_src_[abcd].js,
  build_film.py, props.js, people.js, cap.py, _stills.py, _sheet.py; paths already point to siach_20261028).
  REWRITE the shots in film_src_*.js, then run `python build_film.py` to assemble film.js. Same engine, same page
  contract, same toon look, same people adapter. Reuse helpers (walk cycle, Bochur, Man, RabbiA/RabbiB, study hall, sky,
  dissolves, terrain) wherever they fit. Look at `productions/siach_20261030/BRIEF.md` for how the previous one was specified.
- Read `~/.claude/skills/video-production/references/cartoon_style.md` and `references/builder_kit.md` (worker rules).
- Animals/objects: `C:/projects/_studio-animatzia/lib/toon3d/cast.js` (CAST/ORDER: donkey, sheep, goat, stone, ...) + `toon3d.js`.
- People ONLY through people.js: makeMan(), makeBochur(), makeBoy(), makeRabbiA(), makeRabbiB().
  FATHER (Avraham) = makeRabbiB() (older man, white/grey beard; if RabbiB is not clearly older, use RabbiA and say which).
  SON (Yitzchak, 37) = makeMan() (grown bearded man, broad, strong) - NOT a boy. Both with hat/kippa always visible.
  Treat them with reverence: dignified, calm, never comic; at the binding moment keep the camera mostly wide or behind.
- Page contract exactly as before: `window.__dur`, `window.__seek(t)` (pure function of t, seeded random only),
  `window.__ready`, `?t=`, `?capture`, `?hq=1`. `__seek` must honour the part offset `__T0` exactly as the copied code
  does - keep that code untouched.

## Rules
Men only (NO women or girls anywhere). No crosses/churches/mosques. No readable text, letters or digits anywhere.
NO angel figures, no wings, no faces in the sky - heaven is shown ONLY as light, soft clouds and glowing drops.
No blood, no blade glint, no violence: the knife is a small dark shape held low or in a sheath; it is never pointed at
anyone. Every male has a visible kippa or hat in every frame where his head is visible. Bright warm cartoon palette
(the mountain shots are warm dawn/golden desert-hill tones, not gloomy). Leave the bottom 20% of the frame calm
(captions go there later): no key action below y=80%. Faces readable (hero >= 1/4 frame height in character beats).
Real walk cycles, feet planted, contact shadows. Every shot has a purposeful camera move. Nothing important cut by the
frame edge. No crane that starts inside a mesh. Effects (stones rising, light, drops) are pure functions of t.

## Timeline (film time t, seconds; __dur = 240.9)
Voice starts at t=3.5 and ends at t=236.9. 0-3.5 = title moment (music only): keep the top-centre area of the first shot
calm for a title burned in later. 236.9-240.9 = final wide hold.

| shot | t (film) | what the speaker says | what we SEE |
|---|---|---|---|
| s01 | 0 - 17 | (title) ... they walk on the road; the son asks: where are we going? | very wide dawn over rolling golden desert hills; far away two small figures and a donkey (cast donkey) walk along a winding path toward a distant tall mountain; slow crane down and push in |
| s02 | 17 - 31.66 | to bring a korban; here is wood, here is fire, the knife - what is all this? | medium two-shot walking (real walk cycles): the SON carries a bundle of wood on his back, the FATHER carries a small clay fire-pot with a glowing ember; the son turns his head to the father, one open hand asking; camera tracks alongside |
| s03 | 31.66 - 45 | he was 37, not a child; a strong, heavy man | low heroic angle on the SON alone: broad, tall, carrying the heavy wood easily, striding up the slope against a bright sky; slow push-in to his face |
| s04 | 45 - 58 | he asked his father: where is the lamb? | the SON stops on the path, looks around the empty hills (head turns left and right), no animals anywhere; he spreads his hands, questioning; slow orbit |
| s05 | 58 - 72.17 | (the father answers; they go on together) | the FATHER puts a hand on the son's shoulder and lifts the other hand toward the sky; then both walk on side by side toward the mountain whose summit glows with a soft warm light; camera rises behind them |
| s06 | 72.17 - 85 | I already accepted the command of Hashem | on the summit: the FATHER builds a low altar of rough stones (stones settle into place one by one, pure function of t), then lays the wood on it; the SON helps hand him stones; calm, slow orbit |
| s07 | 85 - 98 | tie me well, hand to foot, like an olah - this is the Akeida | the SON calmly holds out his wrists; the FATHER wraps a simple rope around them; the son's face is peaceful and he nods; close two-shot, gentle push-in (faces readable) |
| s08 | 98 - 110.9 | I am doing it with good feelings; it is a great test | wide: the SON lies peacefully on the wood on the altar, eyes toward the sky, FATHER standing beside, seen from behind/side; camera cranes slowly up and overhead (dignified, no close-up of the binding) |
| s09 | 110.9 - 122 | the angels weep | the sky above the summit opens into soft bright clouds; slow glowing drops of light (like tears) drift down and fall gently toward the son's face; camera looks up from near the altar into the light |
| s10 | 122 - 132.26 | never since creation was there such a moment | very wide: the lone mountain under a vast sky, the glowing drops falling over it like a soft shining rain; a few birds hang still in the air; the world holds its breath; slow pull back |
| s11 | 132.26 - 147 | and then: do not send your hand to the boy | the FATHER (from behind, against the bright sky) has raised one hand (knife = small dark shape, no glint); a strong warm beam of light descends between father and son and his hand stops and lowers; he looks up; camera slow push-in from behind |
| s12 | 147 - 167.52 | Avraham: let me at least do something; - do nothing to him | the FATHER unties the rope; the SON sits up; they embrace warmly; nearby in a thicket of bushes a ram (cast sheep, darker wool, curled horns if possible) is caught by its horns; slow orbit around the embrace |
| s13 | 167.52 - 191.73 | Yitzchak is the hero of honouring parents: ready to give his life for his father | golden hour: FATHER and SON walk down the mountain path together, the son's arm around his father's shoulders, the donkey following; camera cranes back to a wide warm valley |
| s14 | 191.73 - 200.71 | bochurim, you will only really understand this when you become parents | dissolve to the warm study hall: RabbiA stands at the front speaking with open hands; a row of bochurim (makeBochur) at shtenders listen; slow push-in |
| s15 | 200.71 - 218 | bind yourself, even against your logic and what you feel like, like Yitzchak - for your parents | a simple warm home kitchen/dining room (plain, no text): the hero Bochur clears dishes from a table and carries a stack of plain plates; then helps the father of the house (makeMan, hat) lift a heavy box; the father smiles; camera tracks |
| s16 | 218 - 240.9 | everyone take a share in honouring parents; it is our opportunity | the Bochur and his father sit at a set table (white cloth, two lit candles, plain cups, no text); the father places his hand on the son's head (blessing), both smile; camera pulls back slowly through the warm window to a wide calm evening view of the house (236.9-240.9 = hold, gentle drift only) |

Seams: s01-s05 one landscape and path (same hills); s05->s06 dissolve via the glow on the summit; s06-s12 one summit set;
s12->s13 cut; s13->s14 dissolve via golden light; s14->s15 dissolve; s15-s16 one home set.

## Verify and report
Run `python C:/projects/_studio-animatzia/tools/verify_scene.py <absolute path of film_a.html> --timeout 900`; it must PASS
(zero P0/P1). Copy the PASS VERIFY_REPORT.json to the production root if it was written elsewhere. Then make stills
(JPG only, never PNG) of the middle of every shot and LOOK at them: kippa/hat visible, no figure cut, no blank first
frames, nothing in the bottom 20%, no readable text, no wings/angel figures. Fix and re-verify (batch fixes, one full
verify; use --shot for small checks). Do NOT render video. Make one JPG contact sheet of all 16 mid-shot stills at
`_final_stills/sheet.jpg` (adapt _sheet.py). Report in English only (no Hebrew), with the path of the sheet and the final
VERIFY status. Do not spawn sub-agents unless essential, and then one cheap, well-defined one.
