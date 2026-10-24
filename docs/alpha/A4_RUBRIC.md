# A4 — The wall and the link: the rubric

*Committed 24 Oct 2026, **before** any A4 code (`23_ALPHA_CANON` §6, §10). Edit only §5 after the build starts.*

## 1. What A4 is

Three surfaces from canon §6, nothing else:

1. **Keep or release, one keeper per visit** (§4.4). After a catch the card asks: **Keep** or **Let go**. Keeping writes the wall. A second Keep in the same visit swaps: the new fish goes on the wall and the earlier keeper of this visit comes off (it stays in the journal). A visit is one session, from entering the pond until you leave it or close the page.
2. **The wall** (§6.2). One line per species: the heaviest fish of that species you have kept. Each line gives the fish, its weight, the water, the light and the lure. Lines are sorted heaviest first. Released legends will get their own line in a second colour; there are no legends until A5, so the data model carries it and nothing draws it yet. The wall is reachable from the pond (a glyph beside the leave glyph), from the catch card, and at `/wall`. The full catch log stays underneath at `/journal`.
3. **The catch card is a link** (§6.1). Share sends the card image and a link `/c/<code>`. The code carries the pond's seed, the spawn the fish came from, the light, the species, its size, where it was hooked, the lure, and whether it was kept. The link opens that pond: the same fish, the light where the sender had it (still drifting from there), and the fish's silhouette in the water where it was hooked. A line says what was caught and where, never how. The link has its own preview image, so a DM shows the fish before anyone taps it.

## 2. Decisions stated before the build

- **Weight is in lb and oz**, an Ocarina pond homage, from `W = a·L^b` per species in `TUNING.wall`. Switching to kg is a one-line change.
- **A link visitor skips both title screens.** They arrive on the pond with one small card ("A 104 cm Bronze Carp was landed here, at dusk, and kept.") and a "Fish here" button; one tap is needed anyway to unlock sound. The Birb Labs / Vibe Academy credit moves onto that card as one line.
- **The link code is versioned, validated field by field and capped at 400 characters.** A bad or truncated code falls back to the normal title screen; it never throws. (Skyroot learned this the hard way: `parseInt("1e12")` is 1.)
- **The server stores nothing.** The link carries all of its state (canon §6, doctrine amendment).
- **Deferred, said now:** a physical board on the bank (it goes with the walk in A5); the legend line's rendering (no legends exist yet).

## 3. The gates

- **Canon gate (people):** a stranger opens a link cold on a phone and stands on the sender's bank in **< 2 s**. "Stands on the bank" means the pond's first rendered frame; it is measured, not eyeballed, and read back as `window.__waters.firstFrameMs`.
- **Owner gate (`/ab`, review mode).** A4 is features, not a look, so a blind pair cannot judge it. `/ab` becomes a short guided review: a sample link to open cold, then catch → keep → wall → share → open your own link on a second phone. Pass: every ★ item below is a yes.
- **Planted defects (must fail the checks):** a link whose seed is ignored; a second Keep in one visit that adds a line instead of swapping; a corrupted code that crashes instead of falling back.

## 4. Binary rubric (on the phone). Pass: 15 of 18, every ★ required.

### Keep or release
1. ★ Every catch asks Keep or Let go, and either one goes straight back to fishing.
2. ★ Keeping a second fish in the same visit replaces the first on the wall, and says so.
3. Letting a fish go shows it swimming off (a ripple), not just closing a card.
4. Nothing punishes letting go.

### The wall
5. ★ The wall shows one line per species: the heaviest one kept, with weight, water, light and lure.
6. The wall reads as a record board, not a settings list or a spreadsheet.
7. The wall opens from the pond, from the catch card and at `/wall`, and returns to fishing.
8. An empty wall says so plainly and does not hint at how many species there are.
9. The full catch log is still reachable from the wall.

### The link
10. ★ A shared link opens the sender's pond: same fish, same light, and the silhouette where the fish was hooked.
11. ★ Cold open on a phone: the pond is drawn in under 2 s (read back).
12. The arrival card says what was caught and where, never how.
13. The DM preview shows the fish and its name before anyone taps.
14. A broken or old link lands on the normal title screen, without an error.
15. The visitor can fish the sender's pond, and their catches go on their own wall.

### Play and phone
16. ★ Cast, bite, fight and the A3.1 habits are unchanged.
17. ★ Budget unchanged: < 100 draws, < 80k triangles, read back.
18. The leave glyph and a fresh start still work.

## 5. Result

| Date | Build | Cold-open time | Owner review | Rubric | ★ all yes | Verdict |
|---|---|---|---|---|---|---|
| | | | | / 18 | | |
