# REVIEW-visual (lens: Visual and 3D staging)
Inputs: beat sheet 1 + seams sheet 1 (JPG). Reference frames from azamra342/_stills: cannot verify (no JPG there). Kippa checks are at sheet resolution (about 15 px heads).

Shot 1: boy standing mid-courtyard, gold coins ringing him, bench left, trees; at t=5 boy about 22% frame height, by t=10 about 55%.
P1 | film/s1 | t=5s | boy only ~22% frame height at mid-shot (brief: large by 3 s, >=40%) -> pushIn/crane end earlier: camera distance 3.2 -> 1.8 by t=3.0, boy height >=45% | coin halo, courtyard, bench
P0 | film/s1 | t=0-10s | no kippa visible on the boy (dark hair cap only, head reads bare) -> add kippa mesh r=0.11, y offset +0.02 above head top, color #1F3A6B, ink outline | boy look, scale .72

Shot 2: boy from behind at a fork, two stone roads, heap far left, stacks far right.
P1 | film/s2 | t=15s | boy ~28% height, both roads shrink to tiny dots, 10 stacks unreadable -> move camera 25% closer behind boy, stack discs r=.18 -> .30 on road two, heap emissive 0.6 | fork composition
P2 | film/s2 | t=15s | left heap and right stacks are both far and the same yellow haze, not clearly different -> make the heap glow stronger (pointLight 1.2) | boy pose

Shot 3: boy arms wide at heap, coins flying, stall right.
P2 | film/s3 | t=25s | boy ~38%, just under 40% in his key shot -> camera dist -15% | arc coins, stall, flags
P1 | film/s3 | t=20-25s | no kippa visible on the boy -> same kippa fix as s1 | rest

Shot 4: boy walks road two, posts with flags, coins stacks, house at end.
P1 | film/s4 | t=30-35s | boy only ~25% height and at the frame edge (left, partly out) at t=30 -> dolly keeps boy at x=0.35 of frame width, dist -20% | posts and flags, stacks
P2 | film/s4 | t=35s | the sun disc is small and sits behind the house at the seam, little sense of travel -> sun arc across full width, radius x1.5 | warm light

Shot 5: study room, boy behind table, open book glowing.
P1 | film/s5 | t=40s | transparent glass-box walls of the room visible through the dissolve, boy tiny (about 15%) -> hold dissolve alpha to 0.2 s and keep wall materials opaque (transparent=false) | dissolve idea
P1 | film/s5 | t=45-50s | boy only head and shoulders behind a big table, about 30%; arms up at 50 but body hidden -> table lowered 0.15, boy y +0.12 so torso shows | book glow, shelves, lamp
P0 | film/s5 | t=45-50s | no kippa visible on the boy -> kippa fix | window light

Shot 6: queue of men holding hands in a line; boy walks past; heap side not seen.
P0 | film/s6 | t=55s | the 12 men appear in a single line holding hands (reads as a chain, not a poor queue); all identical dark suits with beards, not drab brown/grey simple clothes -> spread arms down (gesture rest), spacing 1.1 -> 0.9, 4 clothes colors from #7A5C3E, #8A8A80, #6B5B4B, #9A8366 | respectful look
P0 | film/s6 | t=55-60s | left half of the split (one man under a huge heap) is absent from the shown frames; only the queue is visible -> add cone ~60 discs at left x=-6 and start with a high crane wide so both sides read | queue
P0 | film/s6 | t=55s | no kippa visible on crowd men or boy at this size (heads dark/bearded, cannot see a skullcap) -> kippa on every figure, color contrast vs hair (#2A4A8A) | poor men smile
P2 | film/s6 | t=55s | boy about 30% height | -> dist -15%

Shot 7: street, five men pass, heart grows.
P1 | film/s7 | t=70s | at the seam the heart (scale 1.6) covers the boy's whole chest and face; boy's face is hidden -> heart offset y +0.5, z +0.8 in front-up of chest, max scale 1.3 so face stays visible | heart colors, pulse
P1 | film/s7 | t=65s | boy ~25% height, walkers at frame edges cut (left, right) -> pull in framing, keep all 5 walkers inside 10%-90% of width | street
P0 | film/s7 | t=60-70s | no kippa visible on passers-by | -> kippa fix

Shot 8: warm evening table, men with beards, plates, lamps.
P1 | film/s8 | t=75s | only 2 figures visible at mid (dense frame), boy about 20% and gesture up not readable; table has empty plates and cups, no sense of 4 men -> camera back 20%, seat all 4 within frame, boy raised finger y +0.25 | warm light, lamps, shelves
P1 | film/s8 | t=75s | figures cut by the table edge and bottom (torsos hidden) -> table lowered 0.15 | dusk window
P1 | film/s8 | t=75s | kippa not visible | -> kippa fix

Seams: 10 s, 30 s dissolves fine; 40 s sun far smaller than in shot 4 mid; 60 s fine continuation, queue still single chain.
P2 | film/seam4-5 | t=40.2s | house and room overlay glass-box edges visible | -> see s5 fix

Counts: P0=5, P1=9, P2=4 (kippa is the main P0 repeated across shots: fix once in the shared look).
DONE 8/8
