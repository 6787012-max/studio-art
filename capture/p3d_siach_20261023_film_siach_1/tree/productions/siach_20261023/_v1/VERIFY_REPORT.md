PARTIAL RUN (shot s01) - not a whole-film report
P0 | NOT_READY | t=- | - | window.__ready never became true: Page.wait_for_function: Timeout 600000ms exceeded. | Fix: run stills.py on the film, read the page errors, fix the first one
P0 | CONSOLE_ERROR | t=- | - | console x1: Failed to load resource: net::ERR_FILE_NOT_FOUND | Fix: fix the first error in the console; failed assets must exist locally
P0 | NO_SAMPLES | t=- | - | 0 frames sampled | Fix: a verify with zero samples is a FAIL; resolve the blocking finding
P1 | REQUEST_FAILED | t=- | - | requestfailed x1: road.js | Fix: fix the first error in the console; failed assets must exist locally
