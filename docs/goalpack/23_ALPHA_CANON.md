# 23_ALPHA_CANON

*Canon for the ALPHA rebuild. Approved by the owner on 24 Oct 2026 from the discussion recorded in `docs/rebuild/01_THE_POND_WE_REMEMBER.md` and `docs/rebuild/02_THE_WATERS.md`. **Where this file conflicts with any earlier goalpack file, this file wins.** Where it is silent, the earlier files stand. The paragraph in `00_OVERVIEW` is still the version of record for what a cast must feel like; this file is the version of record for what the game around that cast is.*

---

## 0. Status and authority

- **Phase:** ALPHA. The MVP (`v0.4-far-water-candidate` through the gear chapter) is complete as a prototype and is the baseline every alpha chapter is A/B'd against.
- **Owner decisions in force (24 Oct 2026):** six waters on one shoreline (§2); one drifting light per visit (§3); the banned lure as a found object (§5); pond of the day (§6); an ending as a last line on the wall (§6.2); the name is under research (§9), working title stays *Reel Mobile*.
- **Still in force, unchanged:** the paragraph (`00`); the iPhone human gate and the five-strangers playtest (`16`); the agent tag policy (`13`: candidates only, never approved, never delete, never force-push); ultracode self-verification for machine-checkable concerns (`18`); zero per-frame allocation; the far-water kernel (`19`), the reveal (`21`), and the two-rod/three-lure gear (`22`) as the base of play.
- **Amended by this file:** `14_DO_NOT_BUILD` (§8 lists every line touched), `22_THE_GEAR` guardrail "no fourth lure" (§5), `08_ART_DIRECTION` camera and palette (§7), `13_CHECKPOINTS` tag names (§10).

---

## 1. What the game is (alpha)

A mobile-first browser fishing game about **one shoreline you walk, six waters you find, one legend in each, a wall with your name on it, and a catch you can send as a link that opens your exact pond.**

The five words the design serves, from the owner: **discovery, the hunt, trial and error, the unknown, persistence.** Each mechanic below names which of the five it exists for. A proposal that serves none of them is out.

What it is not (still): an idle game, an economy, a map-and-stage-select game, a tutorial-driven experience, a feature-stacked RPG. The sequels to the game we are chasing all added breadth and lost the pond. **The rule: depth in one shoreline, never breadth across many.**

---

## 2. The shoreline and the six waters *(discovery)*

One continuous bank. Six fishing spots along it, each a fixed composed camera with the rod in hand bottom-right (`19`, unchanged). **Between spots the player moves** along the bank in a short audited camera walk; the next water is visible before it is reachable and the way to it is found, not unlocked. There is no map, no stage list, no "next" button.

The six waters are the six reference photos (`docs/reference/ponds/`), in this order of discovery:

| # | Water | Reads as | Clarity profile | Legend (rumour only, never in UI) |
|---|---|---|---|---|
| 1 | Garden pond | Home. Clear near, opaque a few metres out. | near-clear → dark | Appears only after the other five are on the wall |
| 2 | Lily pond | Cover. Pads and reed islands hide fish; pads move. Casting onto a pad snags. | brown, opaque, cover mask | Surfaces every few minutes with a sound; sinking lure held still for a long count; long spook |
| 3 | Stone pool | Glass. Everything visible; everything shy. Accuracy trial. | fully clear | Visible from day one on the bottom; never takes a moving lure; the shrine bell stills the pool |
| 4 | Castle moat | Mirror. Can't see in; a fish breaking the reflection is unmissable. Weed marks the shallows. | reflective, opaque | Rises only when the reflection is clean; your own cast ruins it |
| 5 | Cattail marsh | Wind drifts cast and lure; the calm band near the reeds is the spot. A cormorant on the snag dries its wings when the fish are up. | rippled, wind vector | Lives in the snag; tension the right way, not the least |
| 6 | Fog lake | Fog sits on the far water and thins over the visit. Patience is a mechanic. | fog density falls with time | Only heard; cast to the sound |

Rules:

- **Six. No seventh.** Any proposal for a seventh water is refused by this file.
- Each water is **data** on one engine: the far-water kernel's range, accuracy falloff and visibility falloff (`19`) plus a per-water clarity profile, reflectivity, cover mask, fog density and wind vector. No water gets its own code path for casting, fighting or the reveal.
- Each water carries **one legend** (§4), **one thing to find that is not a fish** (§5), and **one light it is best at** (§3).
- Water 2 (the lily pond) is built first after the home pond, because it carries the Ocarina-shaped legend and because it is the test of whether the walk-along-the-bank works. **If water 2 and the walk fail the iPhone gate twice, the shoreline idea stops at two waters and this section is rewritten before water 3.**

---

## 3. One drifting light per visit *(the unknown, persistence)*

Each visit begins at a light the game chooses (dawn, day, dusk, night) and the light drifts slowly for the length of the visit. When the player leaves, the pond remembers; the next visit starts somewhere else. **There is no clock UI, no countdown, no time travel, no weather system.** Fog and wind are properties of a water (§2), not a system.

Fish respond to light: each water has a feeding window at one light, and some fish (and every legend) are only present at some lights. This is Ocarina's sunrise frenzy made visible and learnable, never labelled.

Doctrine amendment: `14_DO_NOT_BUILD` "Day/night cycle (one fixed twilight mood for MVP)" and "Weather system" are amended as above. `08_ART_DIRECTION` "one fixed twilight" becomes **four graded lights per water, with the dusk grade as the hero**.

---

## 4. The hunt *(the hunt, trial and error)*

The paragraph's loop is unchanged: watch the expanse, choose between the fish you can see and the one you cannot, cast long into the dark or wait, the lure lands near not on, the fish follows in, the reveal, the strike, the panic, the land, the again. Four rules are added on top:

1. **Habits.** Fish have a home feature (cover, snag, wall, pads) and a light they feed at. Learnable by watching. Never labelled.
2. **The spook rule.** A cast landing near a fish sends it to the far dark, visibly, for a while. Trial and error with a cost you can see and no life lost.
3. **The still lure.** Holding the lure dead still for a long count is a skill: the rod tip drifts with the thumb, the player sees their own tremor. Every legend asks for it; nothing else does.
4. **Keep or release, one keeper per visit.** Keeping writes the wall. Releasing a legend writes the wall in a second colour. Prestige over loot.

The governing rule, from Dredge's design pillar: **fishing is not frustrating.** The fight stays forgiving; difficulty lives in the hunt. Nobody loses the game. They lose the fish.

**The legend contract** (every legend obeys all of these):
- Rare: present on some visits, by visit count, never by real-world clock.
- Conditional: one condition from the water's own way of reading (§2), never a stat check.
- Costly to blow: a long spook, visible.
- Prize-less: a line on the wall, in its own colour if released. No card flourish beyond the name. No stars.
- Unwritten: nothing in the UI, the journal, the hints or the share card explains the condition. The share card may say what was caught and where; never how.

---

## 5. Things to find *(discovery, trial and error)*

Each water has one object that is not a fish, found by looking, with no marker:

- **The sinking lure** (the home pond, under the bank). The fourth lure. It is **not in the gear strip**: it is found, carried, and the pond's sign forbids it. Catches made with it are marked on the wall as such and earn no line of their own. Legends want it.
- **The shrine bell** (stone pool): tapping it stills the water for a while.
- **The bench with a carved record** (lily pond): a previous angler's line, the only written rumour in the game.
- **The hat** (moat): something on the bank you can hook. Rewards nothing. Fines you nothing either; we have no currency. It just comes off.
- Marsh and fog lake: to be designed in their chapters; one each, same rules.

Doctrine amendment: `22_THE_GEAR` "No third rod or fourth lure" is amended to **"No third rod. No fourth lure in the strip. The sinking lure exists as a found object outside the strip and outside the glyph UI."** Tiers, upgrades, currency and rarity stay forbidden.

---

## 6. Why they come back *(persistence)*

No accounts, no streaks, no notifications, no leaderboards, no ads. Five surfaces:

1. **The catch card is a link.** The share card carries a link that opens the **exact water, light and the silhouette of what was caught**, regrown from a seed the way `/skyroot` regrows a tree, under two seconds, no install. A visitor stands on the sender's bank. If it was a legend, they see where it was hooked and nothing else.
2. **The wall.** At the home pond: best fish, weight, name, water, light, lure. One keeper. Legends released in a second colour. Replaces the journal's list-feel; the journal's data stays underneath. **The wall is the ending (§6.2).**
3. **Pond of the day.** One seed per calendar day for the light sequence and the far-water visitor, shared by everyone. No reward for playing, nothing lost for missing it. It exists so two people can compare notes.
4. **Rumour.** §4's legend contract and §5's unwritten finds. The share card is the carrier.
5. **The drifting light** (§3): "I've never seen the marsh at night" is the reason to open the game.

**6.1 Refused, with the evidence:** idle mode (hollows the still-lure skill), leaderboards, streaks, a store, explaining any secret, a seventh water, a boss fight, a story.

**6.2 The ending.** When all six legends are on the wall, the home pond's own legend appears. Catching or releasing it writes the last line. Nothing unlocks. The pond is then the player's.

Doctrine amendment: `14_DO_NOT_BUILD` "Daily login rewards" stands (there is no reward); "Leaderboards" stands; "Cloud sync / online accounts" stand (the link carries state, the server stores nothing per player).

---

## 7. How it looks and runs

- **Spend on light, not polygons.** Tone mapping and one graded palette per light per water come first. The six photos are the grade references; a 20–30 item binary rubric is committed before the water chapter starts.
- **Water is the hero: one shader, per-water uniforms**, fish drawn as soft blobs *inside* the water so the reveal gradient and the water are one thing. Lifted from `adamrappaport/public/map-assets/water.js` (analytic wave normals, fbm, Schlick Fresnel, Blinn glint, gradient environment) and extended with clarity, distance darkening, cover and fog. Never embed the `/worlds` viewer; lift functions.
- **The bank is real**: instanced stones, reeds, cattails, fence, boardwalk, snag; layered dark fir treeline on the far shore; contact decals; one-uniform wind sway. Ambient life in one draw call each (midges, bubbles, mist, the cormorant, a heron that lifts when the pool is spooked).
- **Camera:** composed and fixed at every fishing spot (`08`, `19`). Moving only on the walk between waters, the arrival shot and the reveal push, all as audited flythrough data. Never free orbit, never first-person.
- **Budget:** < 100 draws, < 80k triangles, ~1.1 MP pixel budget on phones, 2× DPR cap. Shed effects first, then distant detail, then resolution. An Auto chip offers a step down; it never forces one. Every number is read back from the renderer, never echoed from a preset.
- **Skip on phones, measured elsewhere:** planar reflectors, SSAO/SSR/DoF/volumetrics, multi-pass composers, VSM shadows, 120 Hz targets.

Doctrine amendment: `08_ART_DIRECTION` "the world ends 20 metres past the far reeds" becomes "the world ends where the walk ends"; "no horizon" stays per fishing spot.

---

## 8. `14_DO_NOT_BUILD`, line by line

| Line | Status under this canon |
|---|---|
| Multiple ponds | **Amended:** six waters on one shoreline, discovered on foot. Never a menu. |
| World map / overworld | Stands. The shoreline is walked, not mapped. |
| Day/night cycle | **Amended:** one drifting light per visit, no clock UI, no time travel. |
| Weather system | Stands. Fog and wind are per-water properties. |
| Boss fish / encounter mechanics | Stands. A legend is a shy fish with a condition, not a boss. |
| Multiple ponds' sibling: "Procedural open world" | Stands. |
| NPCs / dialogue / quests / story / cutscenes | Stand. The bench's carved line is an object, not an NPC. |
| Daily login rewards / streaks / leaderboards / achievements / rarity stars / XP / currency / shop / IAP / ads | Stand, all of them. |
| Rod tier upgrades (beyond two) / lure tier upgrades (beyond three) | Stand for the strip. The found sinking lure is outside the strip (§5). |
| Tutorial pop-ups / long instructions / onboarding > 10 s | Stand. The home pond is the tutorial. |
| Server-side game logic / accounts / cloud sync | Stand. The link carries state. |
| Real-world location names | Stands. Waters are named by what they are. |
| Everything else in `14` | Stands. |

---

## 9. The name

Working title: **Reel Mobile**. The owner's leading candidate for the alpha is **"The Waters"**. Research on collisions, trademarks, domains and how it reads is in `docs/rebuild/03_THE_NAME.md` (pending at the time of this file; the owner decides from it). Until decided, the alpha site at `adamrappaport.vercel.app/alpha` says *Reel Mobile rebuild*.

---

## 10. Chapters, gates and tags

Each chapter ends at the iPhone gate (`16`) and ships behind the current build until it passes. Tag names replace `13`'s MVP list from here:

| Chapter | Tag | Scope | Gate (beyond typecheck/lint/tests/build) |
|---|---|---|---|
| A1 Light and water | `v1.0-light-candidate` | Tone mapping; the new water shader with in-shader fish; the drifting light; home pond only. Pipeline fixes already shipped (`DEVLOG` 2026-10-24). | Blind paired A/B vs `v0.4` on the owner's iPhone, win threshold stated before the build. Rubric from the six photos. |
| A2 The bank | `v1.1-bank-candidate` | Stones, reeds, treeline, mist, midges, wake pool, contact decals. The home pond becomes photo 01. | Budget read back on device; 10-minute thermal session; A/B vs A1. |
| A3 Habits | `v1.2-habits-candidate` | Fish homes and feeding lights; the spook rule; the still-lure skill. | Five strangers find one habit without being told. |
| A4 The wall and the link | `v1.3-wall-candidate` | Record wall; share card as a regrowable link; keep-or-release. | A stranger opens a link cold on a phone and stands on the sender's bank in < 2 s. |
| A5 The lily pond and the walk | `v1.4-lilypond-candidate` | Water 2, its legend, its find, the walk from the home pond. **The shoreline's proof.** | Two gate failures rewrite §2. |
| A6–A9 Waters 3–6 | `v1.5-stonepool`, `v1.6-moat`, `v1.7-marsh`, `v1.8-foglake` | One water per chapter, each with legend and find. | Same as A5. |
| A10 Pond of the day and the ending | `v1.9-day-candidate` | Shared daily seed; the home pond's legend; the last line. | Two people compare notes on the same day's pond without prompting. |

Build method is the standing one (`20_ROADMAP` §Build approach, `18_ULTRACODE_PARADIGM`), with three additions from the Birb repo's discipline:

- **Every gate has a planted defect that must fail it** before the gate is trusted.
- **Effective state is read back, never echoed:** a headless check on an emulated 3× iPhone asserts the renderer's actual DPR, tier and budgets. Added to CI in A1.
- **Capture sidecars** `{seed, light, tier, build, pose}` on every evidence image; the light is frozen for any A/B.

No chapter ships on a SwiftShader number.

---

## 11. Reading order (replaces `00`'s list for alpha work)

1. `00_OVERVIEW` — the paragraph.
2. **This file.**
3. `docs/rebuild/01_THE_POND_WE_REMEMBER.md` — why, with sources.
4. `docs/rebuild/02_THE_WATERS.md` — the design in prose.
5. `19_THE_FAR_WATER`, `21_THE_REVEAL`, `22_THE_GEAR` — the base of play (unchanged).
6. `16_HUMAN_GATES`, `13_CHECKPOINTS` (tags per §10), `18_ULTRACODE_PARADIGM`.
7. `14_DO_NOT_BUILD` as amended by §8.
8. `adamrappaport/docs/SHARED-WORLDS.md` and `birb/CLAUDE.md` for the kit and the mobile discipline being lifted.
