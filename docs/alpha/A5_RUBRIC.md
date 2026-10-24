# A5 — The lily pond and the walk: the rubric

*Committed 24 Oct 2026, **before** any A5 code (`23_ALPHA_CANON` §2, §4, §5, §10). Edit only §6 after the build starts. **This file holds the legend's conditions. It is never served and never quoted in the UI, the prompts, the hints or the share card** (the legend contract, canon §4).*

## 1. What A5 is

Water 2 and the way to it, on the same engine as the home pond (canon §2: a water is data, not a code path):

1. **The walk.** At the home pond's left edge the reeds part on a worn path, and brighter, open water shows through the trees beyond it. Tapping the path walks you there: a short, fixed camera move along the bank (about 3.5 s) that ends on the lily pond's composed view, rod in hand. The lily pond has its own path back at its right edge. No map, no menu, no "next" button. The water you are at is remembered for the next visit.
2. **The lily pond.**
   - **Water:** brown and opaque (photo 04); the reveal works as on the home pond, but the water reads to about half the home pond's clarity.
   - **Pads:** islands of lily pads that drift slowly, and two reed islands. A fish under a pad shows no shadow at all.
   - **Snags:** a cast landing on a pad snags. The lure sits on the pad; the next tap pulls it free with a splash that spooks fish nearby. Nothing is lost (canon: fishing is not frustrating).
   - **Fish:** Moss Bass, Reed Pike, Moon Minnow and Bronze Carp (no kingfish). Their homes are the pads, the reed islands and the open water.
3. **The find at the home pond: the old sinking lure** (canon §5).
   - **Finding it:** under the near bank, among the stones, a small brass glint shows for a moment every few seconds. Cast onto it and you hook something that is not a fish: an old sinking lure, tangled in line. No marker, no hint.
   - **Carrying it:** once found, it lies on the bank stone at the bottom left of the view. Tap it to tie it on; tap it again, or choose any lure in the strip, to take it off. It is never in the gear strip.
   - **What it does:** it sinks to the bottom and lies dead still.
   - **The sign:** the home pond grows a small wooden sign by the stones: "No sinking lures."
   - **On the wall:** catches made with it are marked "old sinking lure" and do not replace a species line made without it.
4. **The find at the lily pond: the bench** (canon §5). A weathered bench on the right bank. Tap it and a close-up shows one carved line, a previous angler's record: the only written rumour in the game.
5. **The lily pond's legend** (canon §4; see §2 for its conditions).
6. **The water card.** The first time you arrive at the lily pond, its painting (`public/art/waters/02-lily-pond.webp`) fades in full-screen for about 2.5 s with the words "The lily pond", then the pond. Only once.
7. **The wall and the link carry the water.** Wall lines say which water. A catch link carries the water; a visitor arrives at that water.

## 2. The legend (never shown to players)

- **Name:** Old Mossback (a vast, dark, weed-backed carp).
- **Rare:** present only from the third visit to the lily pond on, on odd-numbered visits (3, 5, 7…), and only at **dawn and dusk**. By visit count, never by clock.
- **Tells:** while present, every 2 to 4 minutes it surfaces near its home pad island with a deep sound and a wide swirl, then sinks.
- **Conditional:** it takes only the **old sinking lure**, lying **dead still for 12 s** within 1.2 m of where it is. Any other lure, or a lure that moves, it ignores.
- **Costly to blow:** a cast landing within 1.5 m of it sends it off with a bow wave, and it is gone for the rest of the visit.
- **Prize-less:** kept, it is a line on the wall (no flourish beyond the name). Released, the line is in the second colour. A catch link for it shows only where it was hooked: "Your friend caught something very big in this pond."
- **The bench line** (the rumour): *"OLD MOSSBACK. 31 LB. FIRST LIGHT. IT CAME UP FOR THE ONE ON THE BOTTOM. — R.T. '86"*

## 3. Decisions stated before the build

- One water is drawn at a time. The walk is a camera move along the bank that ends in the next water's composed view. A continuous world with both waters placed side by side waits until it is needed (a physical shoreline can come with water 3, if this passes).
- The sinking-lure catches being "no line of their own" (canon §5) is read as: marked on the wall, and never displacing a line made without it.
- Art arrives in parallel (prompts in `public/art/PROMPTS.md`: `legend-01`, `lilypads`, `treeline-02`, `old-sinker`, `bench-wood`). Until each lands, the code draws a stand-in. The prompts do not mention any condition.

## 4. The gates

- **Canon gate:** water 2 and the walk on the owner's iPhone. **Two failures stop the shoreline at two waters** and canon §2 is rewritten before water 3.
- **Owner review at `/ab`** (review mode): the steps, a debug sample that starts at the lily pond, and the starred checks as yes/no.
- **Planted defects that must fail the checks:** the legend taking a moving lure; the legend present on an even visit; a pad that does not snag; the walk leaving the player at the wrong water.

## 5. Binary rubric (on the phone). Pass: 20 of 24, every ★ required.

### The walk
1. ★ At the home pond, the way to somewhere else is visible but not labelled.
2. ★ Tapping the path walks you along the bank to the lily pond; tapping its path walks you back.
3. The walk takes a few seconds, never feels like a loading screen, and never makes you queasy.
4. Leaving and coming back starts you at the water you were at.
5. The first arrival shows the lily pond's painting, once.

### The lily pond
6. ★ It reads as photo 04: brown still water, pad islands, reed islands, a forested far shore.
7. ★ Pads hide fish; you learn to read the edges of the pads.
8. ★ A cast onto a pad snags; one tap frees it, nothing is lost, nearby fish spook.
9. Pads drift slowly; nothing pops or jitters.
10. The fish here behave differently from the home pond's.
11. Cast, bite, fight and reveal feel exactly as at the home pond.

### Finds
12. ★ The sinking lure can be found by looking, with no marker or hint.
13. Once found, tying it on and taking it off is obvious and never in the gear strip.
14. The home pond's sign appears once the lure has been found.
15. ★ The bench's carved line is readable and feels like a found thing, not UI.

### The legend (owner only; the review page says how to force it)
16. ★ When present it makes itself known now and then, unmistakably and unexplained.
17. ★ It cannot be caught the wrong way, and a careless cast near it costs you the visit.
18. Caught, it feels like an event without a flourish: a name and a line on the wall.

### Wall and link
19. Wall lines name the water.
20. A catch link from the lily pond opens the lily pond.

### Play and phone
21. ★ Budget at the lily pond: < 100 draws, < 80k triangles, read back.
22. No frame drops or heat over 10 minutes moving between the two waters.
23. The A3.1 habits and the A4 wall still work at both waters.
24. Nothing new flickers at rest.

## 6. Result

| Date | Build | Gate try | Owner review | Rubric | ★ all yes | Verdict |
|---|---|---|---|---|---|---|
| 24 Oct 2026 | v1.4-lilypond-candidate | 1 of 2 | pending at `/ab` | / 24 | | pending. Build notes: legend radii corrected to take 1.6 / spook 0.7 (the §2 numbers made it uncatchable); bench line now 90 LB; bench on the left bank (the right was the path); see DEVLOG v1.4. |
