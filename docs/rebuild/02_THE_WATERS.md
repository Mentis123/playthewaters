# 02 — The Waters: a remake design

*Rebuild memo 2, 24 Oct 2026. Companion to `01_THE_POND_WE_REMEMBER.md` (why the Ocarina pond worked, what the kit and Birb give us). This one answers the owner's question: "this is standalone, so what — people don't play? Gotta think bigger about making this FUN." Research behind it is cited at the end; design calls are mine and marked where they bend existing doctrine.*

---

## 0. The answer in one paragraph

"Bigger" does not mean more systems. Every standalone game that spread without a franchise, ads, accounts or a social graph (Wordle, Slow Roads, 2048, Infinite Craft, Townscaper's web demo) had a **tiny loop you understand in ten seconds and one thing you could send to a friend.** Every fishing game people still talk about had **a water you could learn and a fish you could not have.** So the remake is: **one bank you stand on, six waters you find, one legend in each, a wall with your name on it, and a catch you can send as a link that opens your exact pond.** The six reference photos are not mood boards. They are the six waters. The rest of this memo is how each piece earns its place.

---

## 1. What a session is

Three to twelve minutes, phone in portrait, usually one hand. Wordle's whole retention theory was *"three minutes of your time a day, and that's it."* Reel's is: **one visit = one light.** You arrive at the bank at a time of day the game chose (dawn, noon, dusk, night, each with its own rules), the light drifts slowly for the length of the visit, and when you leave, the pond remembers where the light was. The next visit picks up somewhere else. No clock UI, no countdown, no streak. The water is simply different each time you come, the way a real pond is, and some things only happen at one light.

A session has a shape:

1. **Arrive.** A short camera glide down to the bank (the flythrough kernel). You see the whole expanse. Something moves far out.
2. **Read.** Cues on the water: a roll here, a wake there, a dark shape under the lily pads that was not there yesterday.
3. **Hunt.** Cast, wait, work the lure, choose between the fish you can see and the one you cannot.
4. **Reveal.** Hooked. Fight. The shadow comes in out of the dark and *becomes* something.
5. **Keep or release.** One keeper per visit. Beat your wall, or let it go.
6. **Leave with something.** A card you can send. A line on the wall. A rumour you now half-believe.

The owner's paragraph in `00_OVERVIEW` is still the north star. This memo adds the frame around it so that paragraph happens *again tomorrow*.

---

## 2. The world: one place, walked

Not an overworld, not a map screen. **A path along the water's edge** that you walk in a few taps, in real 3D, through the sites in the photos: the rounded-stone bank (01), the castle moat (02), the flagstone pool with its small shrine (03), the lily pond with the fence and the path (04), the foggy long lake (05), the cattail marsh with the snag (06). They sit on one continuous shoreline. The camera is still composed and fixed per fishing spot (the doctrine holds), but **between spots you move**, and the move is where the 3D immersion and the kit's foliage, treeline, mist and water pay for themselves.

Why walking and not a menu: Dredge's team hid distant areas behind mountains because *"what players can't see, players can't want."* A Short Hike's postmortem credits landmarks that spark curiosity and natural barriers as progression. So **the next water is visible before it is reachable** — the moat's watchtower over the trees, the fence line disappearing round the bank — and the way to it is found, not unlocked. Discovery is the progression. There is no "Stage 2" button.

Each site has:

- **A fishing spot** (fixed camera, rod in hand bottom-right, exactly as today).
- **A thing to find** that is not a fish (the sinking lure under the bank; a bench with a carved record from a previous angler; a bell at the shrine).
- **A reason to come back at a different light.**

> **Doctrine note.** `14_DO_NOT_BUILD` says "multiple ponds", "world map", "day/night cycle", "weather system" stay shut *for MVP*. The MVP shipped. This memo proposes the rebuild amend `14`: **one shoreline with six waters, one drifting light, no map, no weather system** (fog and wind are properties of a water, not a system). The sequels proved that *more ponds as a menu* loses the pond. Six waters on one walkable bank is a different thing: it is one pond that keeps going round the corner. **Owner decision required.**

---

## 3. The six waters

Each water teaches one way of reading water and holds one legend. Sizes and distances are per-water tuning, not new code: the far-water kernel (range, accuracy falloff, visibility falloff, reveal gradient) runs everywhere; the water's *clarity profile* and *cover* are data.

| # | Water (photo) | How it reads | What hides here | The legend |
|---|---|---|---|---|
| 1 | **Garden pond** (01) | Home. Clear near the stones, opaque green a few metres out. The teaching water: you can always see fish by the bank. | Mid-sized fish that patrol the near edge. | None at first. The home water's legend appears only after you have found every other water. |
| 2 | **Castle moat** (02) | **A mirror.** Still water that reflects sky and tower; you cannot see in at all, but a fish breaking the reflection is unmissable. Floating weed shows where the shallows are. | Big, slow fish that sit under the wall. | **The one under the tower.** Only rises when the reflection is clean: still air, no ripples from you for a long count. Your own cast ruins it. |
| 3 | **Stone pool** (03) | **Glass.** You see everything: flagstone floor, every fish, every shadow. But they see you. Any cast that lands near one spooks it. The pool is the accuracy trial. | Shy fish; the quiet lure's water. | **The pale one.** Visible from the first visit, lying on the bottom by the boards. Never takes a moving lure. The shrine's bell (tap it) makes the pool go still for a while. Nobody tells you that. |
| 4 | **Lily pond** (04) | **Cover.** Brown water, pads and reed islands. Fish live under the pads; you cannot see them, you can see pads move. Casting onto a pad is a snag. The gaps are the game. | The far big one by the pads. | **The Ocarina homage, our way.** Surfaces every few minutes with a sound; lies on the bottom otherwise; takes the sinking lure held dead still for a long count; spooks for a long time if you blow it; shows up on some visits only. The owner's "lost in it for days" fish. |
| 5 | **Fog lake** (05) | **Fog.** A long water running away from your feet. Fog sits on it at dawn and thins as the light moves, so the far water you cannot read now, you can read in six minutes. Patience is a mechanic, not a wait. | Fish that come in with the fog and leave with it. | **The one you only hear.** A strike far out in full fog; you cannot see where. Cast to the sound. |
| 6 | **Cattail marsh** (06) | **Wind.** Ripples over blue, a calm golden band near the far reeds. Wind drifts your cast and your lure; the calm band is where the fish are and where the cast scatters least. A cormorant on the snag dries its wings when the fish are up (a tell, unexplained). | Fish in the calm band. | **The snag fish.** Lives in the drowned branches; hooks on cover unless you work it out — tension in the *right* direction, not the least. |

Six waters, six legends, six things to find, six lights. That is the whole content budget, and it is already more than the Ocarina pond had. **No seventh.**

---

## 4. The hunt loop, sharpened

The paragraph's loop stays. Four additions, each one of the owner's five words made into a rule a player can learn:

1. **Fish have homes and habits.** Each water's fish have a cover feature and a light they feed at. Learnable by watching, never labelled. A player who visits the lily pond at dusk three times will *know* the pads on the left go live first. That is the knowledge that made Ocarina players "analyze how the pond worked throughout the day."
2. **The spook rule.** A bad cast near a fish sends it to the far dark for a while, visibly. Trial and error with a cost you can see and no life lost.
3. **The still lure.** Holding the lure dead still for a long count is a skill: the rod tip drifts, your thumb has to not move, and the game shows you your own tremor. The legends want it. Nothing else in the game asks for it, so it reads as a secret even though it is on screen.
4. **Keep or release, one keeper.** Every catch ends with the choice. Keeping writes the wall. Releasing a legend writes the wall *differently* (the name in a different colour; Ocarina's loach was released "as endangered" and that was the prestige). Prestige over loot, every time.

And the one rule that governs the rest, from Dredge's design pillar: **"fishing should not be frustrating."** The fight stays forgiving; the *hunt* is where difficulty lives. Nobody loses the game. They lose the fish.

---

## 5. Why people come back (no accounts, no streaks, no ads)

This is the "standalone, so what" answer. Five surfaces, in order of expected pull.

### 5.1 The catch card is a link that opens your pond
Townscaper's web demo encoded the whole town in the URL; Wordle's emoji grid let you share the story without the answer; Infinite Craft's "First Discovery" was a screenshot-able brag. Reel already has a share card and `?seed=`. Make the card **carry a link that opens the exact water, light, and the shadow of what you caught**, the way Skyroot's share link regrows the identical tree. The recipient does not see a screenshot; they *stand on your bank* and cast at the same water. If it was a legend, they see its silhouette where you hooked it and nothing else. That is the "you have to see this." No account. No install. Under two seconds to open.

### 5.2 The wall
Not a journal list. A **record wall at the home pond**: your best fish, its weight, your name, which water, which light, which lure. One keeper. Beating it is the "one more cast." Releasing a legend adds a line in a second colour. The Ocarina record tank, made bigger by six waters. A visitor via link sees your wall.

### 5.3 Pond of the day, shared by everyone
Wordle's real engine was that everyone had the same puzzle, so there was something to compare. Reel's version: **one seed per calendar day for the light and the far-water visitor.** Everyone who plays today meets the same dawn fog on the long lake and the same big shadow under the moat wall. No reward for showing up, nothing lost for missing it; just a reason the group chat has something to say. *(This bends `14`'s "daily login rewards" only in spirit; there is no reward. Owner decision.)*

### 5.4 Rumour
Nothing about the legends, the bell, the cormorant, the sinking lure or the hat is written down anywhere in the game. Webfishing: *"none of the weird parts are telegraphed."* Ocarina: the whole loach legend travelled by word of mouth. The catch-card link is the carrier: a card that says *"Released the pale one — stone pool, dawn"* is a rumour with a door in it.

### 5.5 Time that moves
Alto's carries day/night across runs so the world feels continuous; Slow Roads returns people on a mood, not a reward. The drifting light does the same here for free, once it exists: *"I've never seen the marsh at night"* is a reason to open the game that no notification could make.

What we are **not** doing, because the evidence says it hollows the hunt: idle mode (Cast n Chill's praise, but it would make the still-lure skill meaningless), leaderboards, streaks, a seventh water, a store. Monument Valley's "a definite end" is the one open question: should a full wall be an ending? My call: **no ending, but a last line** — when all six legends are on the wall, the home pond's own legend appears. Then it is yours.

---

## 6. What it looks like on a phone (the graphics plan)

Memo 01 §3 has the ranked technical list. The design-level rules:

- **Light first.** Tone mapping + one palette per light. The six photos are the grade references: 01 and 03 are the clear-water references, 02 is reflection, 04 is cover, 05 is fog, 06 is wind. Rubric and reference images committed before anything is built (Birb's rule: *"a stage with no pre-committed target does not have a hard oracle"*).
- **Water is the hero and it is one shader with per-water uniforms.** Clarity profile (how fast it goes dark with distance), reflectivity (the moat near 1, the pool near 0), cover mask (pads), fog density, wind vector. Fish drawn *inside* the water shader as soft blobs so the reveal gradient and the water are one thing.
- **The bank is real.** Rounded stones, reeds, cattails, a fence, a bench, a boardwalk, a snag: instanced, contact-decaled, swaying on one uniform. The far shore is a layered dark treeline that makes the far water dark for a true reason.
- **Life in one draw call each.** Midges at dusk, bubbles that betray a fish, a cormorant on the snag, mist on the long lake, a heron that lifts off when you spook the pool (a tell, again unexplained).
- **Budget** as Birb's: < 100 draws, < 80k tris, ~1.1 MP, shed effects before resolution, Auto chip that offers a step down. Every number read back, never echoed.
- **The walk** between waters is the one place we spend on camera: a short, audited flythrough along the real bank. It doubles as the studio shot for the alpha site reel.

---

## 7. Order of build (the rebuild arc)

Each chapter ends at the iPhone gate and ships behind the current build until it passes.

1. **Light and water** (home pond only). Tone mapping, the new water shader with in-shader fish, the drifting light. Blind A/B against today's build. *This chapter alone should make the current game look like a different product.*
2. **The bank.** Stones, reeds, treeline, mist, midges, wake pool. The home pond becomes photo 01.
3. **Habits and the spook rule.** Fish homes, feeding lights, spook-to-the-dark. The still-lure skill.
4. **The wall and the link.** Record wall replaces the journal's list-feel; share card becomes a regrowable link.
5. **The second water** (the lily pond, because it carries the Ocarina legend) and the walk to it. This is where the "one shoreline" idea is proven or killed.
6. **Waters 3–6**, one per chapter, each with its legend and its find. Order: stone pool, moat, marsh, fog lake.
7. **Pond of the day.** Last, because it only matters once there is a game worth comparing notes on.

The pipeline fixes from memo 01 §4 shipped today (`pipeline-fixes` in `DEVLOG.md`).

---

## 8. What we are refusing, and why

| Refused | Because |
|---|---|
| A map, a stage select, a world list | Every Zelda sequel that added breadth lost the pond. The shoreline is one place. |
| Economy, XP, rod tiers, rarity stars | Russian Fishing 4's grind complaints; Stardew's "easy or impossible"; `14` is right. |
| Idle mode | Would make the still-lure skill and the far-water gamble meaningless. |
| Leaderboards, streaks, notifications | The wall is yours; the pond of the day is shared without a scoreboard. |
| Explaining any secret in UI | Webfishing, Ocarina, Stardew's legendary fish: the rumour *is* the retention. |
| A seventh water, a boss fight, a story | Six legends is already more than the game that held people for days. |
| Shipping any chapter on a SwiftShader number | Birb: *"No SwiftShader number ever becomes a device claim."* |

---

## 9. Decisions needed from the owner

1. **Six waters on one shoreline** (amends `14_DO_NOT_BUILD` "multiple ponds" / "world map"). Yes / no / "prove it with water 2 first".
2. **One drifting light per visit** (amends "day/night cycle" and "one fixed twilight mood").
3. **The banned lure as a found object** (amends `22_THE_GEAR` "never a 4th lure").
4. **Pond of the day** (shared seed, no reward).
5. **The ending question**: a last line on the wall, or no ending at all.
6. **Name.** "Reel Mobile" was the prototype's name. The game in this memo is about the waters, not the reel. Worth a think before the alpha site gets a title.

---

## Sources

Memo 01's sources, plus: Wardle on Wordle (Game Developer; Slate); Black Salt on Dredge (Game Developer; Boiling Steam TGS interview); A Short Hike postmortem (GDC Vault; Game Developer); Snowman on Alto's (Kill Screen; Red Bull); Ken Wong on Monument Valley (Game Developer); Toukana on Dorfromantik (Game Developer; Digital Trends); FuturLab on PowerWash (Kotaku); Townscaper web demo URL state (Hacker News; PC Gamer); Slow Roads (itch; PC Gamer; G2A on the Sep 2026 Steam release); 2048 (Wikipedia; dev.to); Infinite Craft (Wikipedia; kottke); Cast n Chill (Steam; Vice); Webfishing (Inverse; Cape Creative Collective); Dave the Diver (RPGamer; Shacknews); Vampire Survivors / Balatro loop writing (The Conversation; Shacknews AMA; Game Informer); Quantic Foundry motivations. PWA retention figures were not reliably sourced and are not used. Several quotes came via search summaries; wording to be verified before any is quoted publicly.
