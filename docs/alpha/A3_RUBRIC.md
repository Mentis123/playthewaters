# A3 — Habits: the rubric

*Committed 24 Oct 2026, **before** any A3 code (`23_ALPHA_CANON` §4, §10). Edit only §5 after the build starts.*

## 1. What A3 is

A3 makes the home pond **learnable**. Nothing in it is labelled, explained or shown in UI; a player finds it by watching and failing. Four rules (canon §4):

1. **Homes.** Each fish has a home feature on the home pond and returns to it: the stones (near left), the reeds (left and right banks), the deep (far, dark), the open water. Species prefer different homes.
2. **Feeding lights.** Each species feeds at one or two of the four lights. Off its light a fish stays close to home, slow and incurious. On its light it roams wider, comes nearer, notices more, and its cues come more often.
3. **The spook rule.** A cast that lands *on top of* a fish (inside a small radius) sends it darting to the far dark, visibly (a wake), where it ignores lures for a while. A cast that lands *near* a fish (outside that radius, inside its notice range) draws it in. The band between is the skill.
4. **The still lure.** Some fish (the old kingfish always; the bronze carp off its feeding light) will look at a lure but only commit if it has been dead still for a long count. A faint ring around the lure closes as stillness builds and resets the instant it moves: the player sees their own tremor.

## 2. Scope, stated before the build

- **In:** the four rules on the home pond, as data (homes, preferences and feeding lights in `TUNING`), on the existing fish engine. Pure, unit-tested logic.
- **Out:** legends (A5+), the wall (A4), new species, any UI that names a habit.
- **Wake pool** (deferred here from A2): **moved to the backlog**, to be done only if the phone shows jank. Birb's rule is to measure before optimising, and the frame is 28–37 draw calls against a 100 budget. Converting ripples now buys nothing a player can feel.
- **Baselines:** `?look=a2` renders A2 exactly with habits off (fish wander as before); `?look=a1`, `?look=classic` as before.

## 3. The gates

1. **Blind gate (owner):** `/ab`, two rounds (**day**, **night**), A3 against A2, hidden order. The page tells the reviewer what changed and what to try in *both* ponds. **Pass: A3 picked in both rounds.**
2. **The canon's gate:** five people who have never seen the game each play the home pond for 10 minutes, untold, then answer "is there anything you noticed about how the fish behave?" **Pass: at least one habit (home, feeding light, spook, still lure) named by at least three of the five.** Unrun stays recorded as unrun.

## 4. Binary rubric (A3 only, on the phone). Pass 14 of 18, every ★ required.

1. ★ Casting right on top of a fish makes it dart away with a visible wake.
2. ★ A spooked fish heads for the far dark and does not come back to the lure for a while.
3. ★ Casting near (not on) a fish still draws it in as in A2.
4. Over a few minutes, the same kinds of shadow keep turning up in the same places.
5. Some fish are clearly busier at one light than another.
6. At night, something big comes up from the deep toward the near water.
7. At day, fish around the stones are the busy ones.
8. Cues (ripples, wakes) are more frequent where fish are feeding.
9. ★ Some fish look at a still lure and only take it after a long wait.
10. ★ The ring around the lure closes while it is still and resets when it moves.
11. The ring never reads as a target, a timer or UI.
12. Twitching the lure on purpose still attracts curious fish, as in A2.
13. Nothing in the game names a habit, a home or a feeding time.
14. ★ Cast, bite, fight and reveal still feel as in A2.
15. The pond never goes empty: there is always something to cast at within a minute.
16. ★ Budget unchanged: < 100 draws, < 80k triangles, read back.
17. No new heat or frame drops over 10 minutes.
18. The leave glyph and a fresh start still work.

## 5. Result

| Date | Build | Round 1 (day) | Round 2 (night) | Strangers | Rubric | ★ all yes | Verdict |
|---|---|---|---|---|---|---|---|
| | | | | / 5 | / 18 | | |
