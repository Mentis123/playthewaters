# Gear, revisited (25 Oct 2026)

*Owner: "are the lures and the rods good? … it was an assumption made in the design early on, and we've changed quite a bit." This is the evaluation. Nothing here is built; the fixes are listed for the next session to execute once the owner picks.*

## 1. What the gear is now, measured

From `TUNING.gear`, `TUNING.input`, `TUNING.fish`, `TUNING.habits` on the current build:

| Piece | What it actually does on the home pond |
|---|---|
| Long rod | Reaches z −6.5 (past the fishable edge at −5.4). Scatter 0.50 m at half reach, 1.65 m at full. |
| Short rod | Reaches z **−2.7**. The reveal zone starts at −3.0; the deep home is at −4.5; the lily pads sit at −2.6 and −3.9; the legend at −3.9. Scatter 0.25 m at half reach, 0.34 m at full. Line snaps at 82%. |
| Natural lure | Notice 2.0 m, fear 0.40 m, landing-spook 0.75 m. |
| Popper | Notice **3.2 m**, fear 0.60 m, landing-spook **1.13 m**, floats longer, bigger twitch. |
| "Sinker" (the quiet lure) | Notice 1.4 m, fear 0.24 m, landing-spook 0.45 m, sinks 1.5×. |
| Old sinking lure (found, A5) | Notice 1.1 m, fear 0.16 m, landing-spook 0.30 m, sinks 2.4× and **deeper** (the only lure that reaches the bottom). The legend's only key. |

No one has measured which gear players choose: gear is not in telemetry or the playtest form, and the playtest database has **0 rows** (the five strangers have not played yet).

## 2. What changed since the gear was designed (`22_THE_GEAR`, one pond, no habits)

- **A3 habits**: fish have homes and feeding lights; a careless landing spooks; some fish only take a still lure. The lures' fear multipliers now scale the landing-spook radius too, so the popper flushes a 1.1 m circle on landing while the quiet lure flushes 0.45 m. That is a real, new difference.
- **A4 the wall**: the lure is printed on every wall line and catch card ("Took the natural lure"). Gear is now part of the record.
- **A5 the waters and the found lure**: a second water with cover (pads), a found lure that sinks to the bottom, a sign that forbids sinking lures, and four more waters coming, each with a stated way of reading (canon §2).

## 3. What the research says (summary; sources in the session)

- **Ocarina's pond has one rod and no line choice.** The whole tackle decision is the sinking lure: found, forbidden, and the only way to the deep fish. Players remember it because they found it themselves and because it opens a different part of the pond.
- **Stardew's tackle** has one dominant option (the trap bobber); the rest are niche or pointless. A choice with a best answer becomes a lookup.
- **Dredge** kept fishing forgiving on purpose: choices change what you do, not whether you succeed.
- **Recurring principles:** no dominant option; discovery beats instruction; each option must open something *different*, not something stronger; the choice should be readable before the cast.
- **Best-supported model for a no-progression game:** matching the *conditions* (depth, cover, light, wind, visibility), then risk/reward. Species-matching tables are the weakest.

## 4. Verdict

**The three lures are good and get better with every water. The rods are the weak half. One naming collision is a real defect.**

### 4.1 Defect: two sinking lures
The strip's quiet lure is called **Sinker** and sinks; the found lure is the **old sinking lure**; the home pond's sign says **NO SINKING LURES** while a Sinker sits in the strip. Fix: the quiet lure stops sinking (`sinkMult` 1.0) and is renamed **Quiet** (a small dull nymph glyph). Then the found lure is the only thing in the game that goes to the bottom, which is what the sign forbids and what the bench hints at ("the one on the bottom"). The found lure becomes genuinely different, not "a stronger sinker".

### 4.2 The lures are condition-matching once the six waters exist
Map the existing three onto canon §2's waters, without changing a number:

| Water | Its way of reading | Lure it favours | Why |
|---|---|---|---|
| Home | clear near, dark far | natural | the baseline |
| Lily pond | cover, snags | **quiet** near the pads (small landing-spook under cover); popper to pull a fish out from under a pad | both have a job |
| Stone pool | glass, everything shy | **quiet** | the loud lure clears the pool |
| Moat | mirror; your own cast ruins the reflection | **quiet** | the smallest splash |
| Marsh | wind drifts the lure | **popper** floats and drifts into the calm band; the quiet lure holds | wind is real only for a floating lure |
| Fog lake | cast to the sound | **popper** (its draw rescues a cast you made blind) | the big net |

So the lures are a sidegrade that *each water tilts*, which is exactly the model the research supports. Keep three. Give each water a `lureBias` field in `WATERS` (data, never labelled) so a water can nudge attract/fear per lure a little (±15%) and the tilt above is felt, not implied.

### 4.3 Make the lure choice readable before and at the cast
Today nothing changes on screen when you pick a lure. Cheap fixes, all presentation:
- **Popper:** a bigger, louder splash on landing (ripple 1.4×, plop louder) and a visible float.
- **Quiet:** a small "plip", a smaller ring.
- **Old sinking lure:** it visibly goes down and stops (already deeper; add a thin sink trail).
- The lure glyph on the rod tip while aiming, so the choice is in your hand, not only in the strip.

### 4.4 The rods: fix the price, give the short rod its water
- **The short rod cannot reach anything hidden.** On the home pond it ends 0.3 m short of the reveal zone; it cannot reach the kingfish's deep, the far pads, the reed island or the legend. The game's whole second half (the unknown, the legends) lives in the far water, so the short rod renounces the game. That makes it close to Stardew's lead bobber: a dominated option.
- Its downside is also *invisible*: an 18% weaker line is a tax you discover mid-fight, which the research calls punishment, not choice.
- **Fix:** reach ×0.75 (to z −4.1: the reveal zone and the pad islands, never the deep band at −4.5 to −5.4), accuracy ×0.5 as now, and **line strength 1.0** (reach is the whole price; nothing hidden). The short rod then says one clear thing: *I will not fish the dark.*
- **Its water is the stone pool** (water 3: "accuracy trial, everything visible, everything shy"). Until then it is a quiet option on the home pond, which is fine.
- **Do not go to one rod yet** (Ocarina's model). It is tempting, but the stone pool is designed around precision and the canon pre-authorises two rods. Decide after water 3, with data.

### 4.5 Measure before the next change
Add `rodId`/`lureId` to the session telemetry and the playtest form's device record, and a "which lure did you end up using, and why?" line to the open question. Then the five strangers answer this question for us.

## 5. The list for the next session (in order)

1. Rename Sinker → Quiet, `sinkMult` 1.0, new nymph glyph, update `LURE_LABELS`, the card ("Took the quiet lure"), the explainer, and migrate saved gear (`sinker` → `quiet`) and old journal/wall rows (display only).
2. Short rod: `rangeMult` 0.75, `lineStrengthMult` 1.0; update the explainer text and the A2/A3 rubric notes.
3. Lure presentation: popper splash and float, quiet plip, old-sinker sink trail, lure glyph on the rod tip while aiming.
4. `WATERS[*].lureBias` (home: none; lily: quiet −20% landing-spook, popper +20% attract) with a unit test that the baselines stay exact.
5. Gear in telemetry and the playtest form.
6. Record the decision in `22_THE_GEAR` as an amendment (one paragraph), and put the short rod's stone-pool role in the A6 rubric when it is written.
