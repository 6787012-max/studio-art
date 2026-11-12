# gezer_trip / film_a - "A day of learning in the field" (95 s, 10 shots, NO PEOPLE, NO TEXT IN THE PICTURE)

Purpose: ten 3D explainer shots that are cut INTO real trip footage (school trip of 12-year-old boys:
a vineyard, the ancient mound of Tel Gezer, a forest). The real footage shows the boys; these shots SHOW THE IDEA
of each station so that a parent who was not there understands it. The animation explains - it is not decoration.

Hard rules
- No human figures, hands, silhouettes or faces. No animals needed. Objects, landscapes, buildings, maps only.
- NO text, letters or digits rendered in the picture (captions and labels are overlaid later by the supervisor).
  The ONLY exception is shot s3, where four letter SHAPES are built as hedges from stroke coordinates in `elul_strokes.json`.
- Keep the bottom 170 px (of 1080) free of anything important: a caption box is overlaid there.
- Every frame is a pure function of t. `__seek(t)` must add `window.__T0||0`. After warm(), render one frame of every shot before `__ready`.
- Real film look: camera moves in EVERY shot (eased), three depth layers in every shot, contact shadows, no glow cones.
- 1920x1080, 30 fps. Shot start times O = [0,10,20,32,42,51,61,69,77,87], film ends at 95.0. Hard cut between shots (they are used as separate clips).

Palette (hex): soil #b99766, light soil #d9c58f, limestone #e9dcc0 / #cdbb95 / shadow side #8c7a55, grass #9cc56a / #86b257,
vine green #5c8a3a, hedge green #1f5a22, pine #2f6b3a, wheat #d9a520, sea #3f86b4, shallow water #6ec6ff, route red #c0541f,
route green #2e7d4f, gold accent #ffd24a, navy #06213c. Sky: gradient #79c3ee (top) to #fbe9bd (horizon), 2-3 soft clouds.
Light: warm morning sun from the south-east (key #fff1d0), soft sky fill (#bcd9f5), long soft shadows.
Map convention: west (sea) is screen-LEFT, north is up/away.

## s0 map_journey (0-10 s) - where we went
- World: relief map of central Israel about 60 x 45 km on a table-like slab: sea strip on the left, green lowland, brown hills rising to the east.
  Four pins (simple 3D map pins, no text): START pin navy at (x 6, z -8); STOP-1 pin red at (-10, 4); STOP-1b small red pin 0.6 left of it; STOP-2 pin green at (9, -3); a small walled city model in the far east hills at (22, -2).
- Action: red route ribbon grows from START to STOP-1 (t 1.5-4.5); a toy bus (yellow box body, navy windows, 4 wheels) rides its tip; pins pop when reached (0.8, 4.5, 4.8). Green ribbon grows STOP-1 to STOP-2 (t 6.0-8.0), bus rides it, STOP-2 pin pops at 8.0.
- Camera: starts HI top-down 75 deg far (whole map), cranes down and pushes toward STOP-1 (t 0-5, ease in-out) until the route fills 60% of frame; then pans east following the bus to STOP-2 (t 5.5-9), ends tilt 45 deg. Layers: 1 = two soft clouds drifting under the camera, 2 = map + route, 3 = far hills haze + sky.

## s1 key_road (10-20 s) - why this hill matters: it guards the road from the sea to the capital in the mountains
- World: side-on landscape strip 80 units long. West end: sea with gentle waves and a small harbour jetty. Then flat plain with field patches. At x=-5 the TEL: a flat-topped mound 6 high with a walled city on top (stone wall, 4 towers, a gate facing the road). Then a valley, then mountains 18 high with a bigger walled city on the ridge at x=30.
  A pale road ribbon runs from the jetty, right below the tel gate, and climbs to the mountain city. Three small ox-carts (box on two wheels, no animals) roll along the road.
- Action: at t 4.2 a golden 3D key (ring + shaft + two teeth, 2.5 units) drops in above the tel gate, spins once and rests (t 5.4-7).
- Camera: dolly along the road from the sea (t 0, low, 35mm, jetty in foreground) to the tel (t 4, tel fills 55% of frame height, hold 3 s with slow push), then rises and travels to the mountain city (t 7-10, ends looking up at it). Layers: 1 = roadside rocks/bushes passing, 2 = road + tel, 3 = mountains + sky.

## s2 time_road (20-32 s) - four eras on the same hill
- World: top of the tel, a paved stone path running straight; four stone pedestals along it, 9 units apart, each with one object:
  P1 round shield with a boss + a spear leaning (bronze); P2 a golden crown; P3 a miniature six-chamber city gate (limestone); P4 a clay oil jug with a small steady flame beside it on a stone lamp.
  Background: low ruined walls, dry grass, far lowland.
- Action: each object rises from its pedestal with a small dust puff as the camera arrives (t 1.5, 4.5, 7.5, 10.0), then turns slowly.
- Camera: dolly along the path, stopping about 2 s at each pedestal; alternate MS (P1), CU (P2), MS low angle (P3), CU (P4); ease out into every stop. Layers: 1 = grass tufts/stones at frame edge, 2 = pedestal, 3 = walls + lowland + sky.

## s3 elul_vineyard (32-42 s) - THE HERO SHOT: a word planted in a vineyard, visible only from the air
- World: a vineyard on a gently rolling slope, 60 x 40 units: straight vine rows (instanced small leafy bushes on posts, vine green) running east-west, spaced 1.6. In the centre a clearing of light soil 30 x 12 holding four giant LETTER SHAPES built as hedges
  (hedge green, 0.55 wide, 0.7 high, rounded tops) following the polylines in `elul_strokes.json` (world x,z coordinates given there; read from the SOUTH they form a word, do not mirror, do not add or change strokes).
  Around: a dirt track, a few olive trees (grey-green), a stone terrace wall, far hills.
- Action: hedges grow out of the soil stroke by stroke in file order at t 4.0, 4.5, 5.0, 5.5 (scale Y 0 to 1, ease out back).
- Camera: t 0-3.5 low between two vine rows at grape height moving forward north (leaves brushing past in foreground; the hedges ahead are just green walls, unreadable); t 3.5-6.5 fast crane up and tilt down to 70 deg, positioned SOUTH of the clearing looking north, so the four shapes fill 60% of frame width;
  t 6.5-10 slow 8 deg orbit, hold. Layers: 1 = vine leaves (start) then a drifting cloud shadow, 2 = clearing + hedges, 3 = vine rows to the horizon + hills + sky.
- Must be true in the final 3 s: all four shapes fully inside the frame, above the bottom 170 px, clearly separated, seen from the south.

## s4 calendar_stone (42-51 s) - an ancient farmer's calendar scratched on a small limestone tablet
- World: bare soil, a limestone tablet (irregular hand-broken outline, 3 wide x 4 high x 0.5 thick, scaled up) standing slightly tilted; eight round flat stone tokens (1.1 diameter) in an arc on the ground in front, each with one small 3D icon:
  1 olive branch, 2 sprouting seed, 3 young green shoot, 4 flax bundle (blue-grey stems), 5 barley sheaf, 6 wheat sheaf, 7 grape cluster, 8 fig.
- Action: tablet rises from the soil with dust (t 0-1.5); seven horizontal scratched lines (dark grooves, uneven lengths) are engraved one after another (t 1.5-4.0); tokens pop one by one right-to-left (t 3.0-6.5); at t 7.0 token 2 (sprouting seed) lifts 0.3 and gets a gold ring (this trip was in the sowing month); hold.
- Camera: CU on the tablet, slow 25 deg orbit (t 0-4.5), pull back and tilt down to include the arc of tokens (t 4.5-7), small push to token 2 (t 7-9). Layers: 1 = dry grass tuft, 2 = tablet + tokens, 3 = blurred tel slope + sky.

## s5 water_system (51-61 s) - how a besieged city reached water: a stepped tunnel cut down through rock
- World: a hill cut open like a section model (flat cut face toward the camera, rock #c7a871 to #7d6039 with strata lines). On top: city wall and one tower, and a stone-lined entrance. From it a stepped tunnel (4 wide, dark inside, about 40 clearly modelled steps) descends diagonally at 30 deg to a cave holding water (shallow-water blue, gentle ripples).
- Action: a small oil-lantern object (warm point light, radius 6) goes down the steps (t 1.5-7.0), lighting the walls as it passes; three water drops fall from the cave roof (t 7.2, 7.7, 8.2) making ripples.
- Camera: trucks down-left with the lantern, keeping it at 40% of frame width (t 1.5-7); starts as WS of the whole section (t 0-1.5), ends MCU on the water cave (t 8-10). Layers: 1 = surface grass/bushes on the hilltop edge, 2 = cut rock + tunnel, 3 = sky.

## s6 solomon_gate (61-69 s) - a king's city gate with rooms and benches where the judges sat
- World: a six-chamber gate: passage 4.2 wide, three chambers on each side (each 3 x 5) with low stone benches along their walls, two towers at the outer end, ashlar limestone, wooden double door open. A drain channel runs down the middle of the passage. City wall continues both sides.
- Action: the gate builds itself course by course from foundation stones (t 0-3.5, stones drop in with tiny dust).
- Camera: low WS in front of the gate during the build (t 0-3.5), then pushes through the passage at eye height (t 3.5-7), glancing left into a chamber with its benches (t 5-6), exits into sunlight and a view of houses (t 7-8). Layers: 1 = door leaf / chamber pier passing, 2 = passage + benches, 3 = city + sky.

## s7 standing_stones (69-77 s) - ten huge standing stones in a row
- World: ten monoliths in a north-south row (rough limestone, rounded tops, heights 1.6, 2.1, 2.6, 3.3, 2.2, 2.9, 2.4, 1.8, 2.7, 2.0; widths 0.7-1.2), a low square stone basin block in front of the row, dry grass, far view of the lowland.
- Action: stones rise from the ground one after another (t 0.5-3.5, soil crumbs); at t 4.5 a striped surveyor's pole (red/white bands, three equal segments, exactly as tall as the tallest stone) rises beside the tallest stone.
- Camera: low angle (0.6 above ground) orbit 40 deg around the row (t 0-6), then a small crane up (t 6-8). Low sun, long shadows across the grass. Layers: 1 = grass blades / small rock close to lens, 2 = stones, 3 = lowland + sky.

## s8 dan_camp (77-87 s) - an ancient camp between two hill towns, wheat fields in the plain below
- World: two hills; on each a small walled town (10-12 box houses, wall); in the saddle between them seven cream tents (cones with a dark door slit) around a campfire (flicker light); below, in the foreground, a wide wheat field (instanced stalks, wheat colour, swaying).
- Action: tents pop up one by one (t 2.0-4.0); two wind gusts sweep across the wheat (t 6-9, a travelling bend in the stalks).
- Camera: starts low inside the wheat (stalks in foreground) moving forward (t 0-3), cranes up over the camp (t 3-7), ends WS holding both towns and the camp (t 7-10) with slow push. Layers: 1 = wheat ears, 2 = camp, 3 = hill towns + sky.

## s9 forest_clearing (87-95 s) - the forest stop: baking together and a trust game with a rope
- World: pine forest clearing: 14+ pines (two sizes), needles/brown ground, two wooden picnic tables with benches, a convex iron baking dome (saj) over a small fire with four round flat breads on it, light smoke puffs; on open ground a long thick rope laid in a ring 6 across.
- Action: breads pop onto the dome one by one (t 1-3); from t 4 the rope ring lifts to 0.9 height and is pulled taut into a perfect circle that leans outward slightly and breathes (as if a circle of friends leans back on it), t 4-8.
- Camera: low orbit 50 deg through the trunks (trunks pass in foreground), starting on the saj (t 0-4) and ending on the rope ring (t 4-8). Soft sun patches on the ground, no light shafts. Layers: 1 = trunks, 2 = saj / rope, 3 = deep forest + sky gaps.
