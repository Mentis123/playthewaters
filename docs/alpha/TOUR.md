# The review tour (25 Oct 2026)

*Owner: "when I open the page for review from /ab … little flyover explainers that are showcasing the things for me to review and I can click next next … a special version of the game for AB testing where you show me the things I need to be checking. Like an overlay." Then: "build the tour, card at the top is fine".*

## What it is

`/ab` → **Start the tour** opens `/game?water=home&tour=<chapter>&legend=1`. A card sits at the top of the game:

- the step (`Review A5.1 · 6/19`) and the stop's title; tap that line to fold the card to one line;
- **one line** saying what to look at or do;
- for a do stop, **"Your turn."** until the game sees it done, then **Done ✓**;
- the stop's **/ab check** with Yes / No, saved under the same key `/ab` reads (`thewaters.review.<chapter>`), so the `/ab` summary fills in without leaving the water;
- **‹** back, **Next** (or **Skip** while a do stop is not done), and **Show me** on stops whose check is about finding the thing unaided.

A gold pulsing outline points at the thing: a DOM element (a CSS selector) or a shore thing whose screen position the scene writes every frame (the path, the bench, the found lure's stone, and `glint`, the unfound lure's glint, which has no hit test so a tap can never tie it on early). The HUD at the top (the bag, the pond note) moves below the card; the bag sheet is shortened by the card's height.

Progress is remembered on the device (`thewaters.tour.<chapter>`); `/ab` → **From the top** clears it.

## How it is built

- `src/game/tour/review.ts`: the chapter's review (`REVIEW`): one source for `/ab` and the tour.
- `src/game/tour/tours.ts`: pure data. A tour is a list of stops `{ id, title, line, point?, reveal?, setup?, done?, check? }` plus `stopDone()`.
- `src/components/game/TourOverlay.tsx`: the card and the pointer. It polls the game's review probe every 250 ms and listens to the telemetry stream (`track()` now also dispatches `waters:track`) for casts and shares.
- `GameClient.tsx`: `tourApi` (probe, shore points, setups). Setups go through the paths a player's taps take (`applyGear`, the bag, `finishResult` for a landed fish, the legend's next surfacing). They wait until the game can take them: never during a bite, a fight, a result or a walk. One review convenience: the gear setup brings an idle lure home so the next cast is with the new gear.
- `?tour=` also turns on the review hooks (`window.__watersDebug`) without the debug panel.

## Rules

1. **A chapter's tour is written with its rubric, before the build.** Its stops ask every check; `tests/unit/tour.test.ts` fails if one is unasked (planted: dropping a stop is caught).
2. **No legend's conditions in any line.** The tour and review files are served. The unit test scans the legend stop and check for the giveaway words.
3. **Only with `?tour=`.** Never linked from the game; unknown ids show nothing.
4. **Look stops set the scene and ask. Do stops wait for the reviewer to do it.** A stop does not play the game for the reviewer except where the check is not about the doing (a landed fish to test the Keep flow).

## Later (not built)

- The same machinery as the five-strangers playtest: hide the explainer lines, keep the pointer and the question.
