# dira265 - 3D walkthrough of a ground-floor apartment (no people, no narration; captions + soft music)
Film: film_a.html, 1920x1080 landscape, 30fps, total ~240 s. Deterministic: everything is a function of t; custom __seek adds window.__T0||0.
Captions ONLY by id from captions_vault.json (Hebrew RTL, bottom-center lower-third card, rubik/heebo bold, fade 0.5 s, each >= 6 s). Never type Hebrew in code.

## Data
- Geometry: C:/projects/dira-psgat-amos/plans/geometry.json (cm; origin SW; x east, y north). Use its room rectangles. Where offsets conflict, keep rooms tiling cleanly; room dims as written are the truth.
- Rooms (cm): living_dining 531x291, kitchen 376x235 (L counter), bed1_parents 306x346, bed2_mamad 316x289 (walls 30 cm, steel door, blast window), bath_main 212x289 (tub 162 + laundry niche 122), wc_guest 82x167, sun terrace 281x126 north of bed1, entrance hall/corridor fills the gap. Exterior walls 25, interior 10, ceiling 270 (cut away / hidden in overhead shots).
- Yard ~12 m2 next to the living-room exit (grass, sandstone tiles, low stone wall). Roof: flat, 2 solar panels + 150 L tank per unit.
- Style + materials: C:/projects/dira-psgat-amos/plans/style_notes.md (warm minimal: off-white walls #F2F0EB, grey-beige porcelain floor #D6D3CC 60x60 grid lines, light oak + walnut, black accents, gold decor, many plants, cream tufted headboards). Living/kitchen not observed there - use same palette (cream sofa, oak dining table 6 chairs, white kitchen cabinets with oak, light quartz counter).
- Furnish every room fully (beds, wardrobes, desk in mamad as kids room, sofa, TV unit, rug, dining set, kitchen appliances, bath vanity, towels, washing machine, plants, curtains, ceiling lights). NO PEOPLE, no figures, no faces.
- Light: warm sun from windows (directional + hemisphere + soft shadows), ACES tone mapping, sRGB.

## Shots (time s)
| # | t | shot | camera | captions |
|---|---|---|---|---|
| 1 | 0-12 | aerial over hillside village, plot 265 outlined glowing, house 2 highlighted | slow crane down | c01 0-6, c02 6-12 |
| 2 | 12-22 | site: plot, house footprint, neighbour 266, north arrow | orbit 30 deg | c03 |
| 3 | 22-38 | dollhouse cutaway (no roof), labels float per room with dims as 3D tags (numbers only, latin digits) | slow orbit 360 | c04 22-30, c25 30-38 |
| 4 | 38-48 | entrance door opens, hall | push-in eye level 160 cm | c05 |
| 5 | 48-66 | living + dining, dimension lines animate along walls (531 / 291) | truck left->right | c06 48-58, c18 58-66 |
| 6 | 66-74 | glass door to yard, shutter rolls up | push-in | c07 |
| 7 | 74-96 | kitchen L counter, cabinets open one by one, 6 m counter measured by animated line | orbit inside | c08 74-82, c09 82-89, c10 89-96 |
| 8 | 96-114 | parents room, bed, wardrobe, window shutter goes up | dolly + pan | c11 96-106, c12 106-114 |
| 9 | 114-122 | sun terrace with 2 chairs + plants | push out to terrace | c13 |
| 10 | 122-136 | mamad kids room, thick wall cross-section highlighted | crane down | c14 |
| 11 | 136-156 | main bathroom tub, laundry niche, tile height 2 m line glows | slow pan | c15 136-146, c16 146-156 |
| 12 | 156-164 | guest WC, 1.20 m tile line | short push | c17 |
| 13 | 164-176 | yard: grass, tiles, swing, table | crane out from living door | c19 |
| 14 | 176-188 | roof: solar panels, tank | rise to roof | c20 |
| 15 | 188-196 | AC socket point glowing on wall, no unit | insert | c21 |
| 16 | 196-224 | dollhouse again, warning icons (yellow triangles) pop over relevant spots | slow orbit | c22 196-205, c23 205-214, c24 214-224 |
| 17 | 224-240 | dusk exterior, windows light up warm, fade out | slow pull back | c26 |
Camera ease in/out, never static >3 s, something moving every 2 s (doors, shutters, cabinet doors, dim lines, curtains in light breeze, plant sway).
