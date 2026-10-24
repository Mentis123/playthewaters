# The Waters — art wanted

*For image agents and artists. Live copy: https://playthewaters.vercel.app/art/PROMPTS.md · machine-readable: `/art/prompts.json` (same list, with sizes, delivery paths and status). Repo: `Mentis123/playthewaters` (private). Canon: `docs/goalpack/23_ALPHA_CANON.md`.*

## How to deliver

1. Generate at the size given. Deliver the **exact filename at the exact path** in the repo. The game looks for those paths.
2. Flip that prompt's `status` in `public/art/prompts.json` from `wanted` to `delivered`, and add `deliveredBy` and `date`.
3. Commit with the message `art: <prompt id>`. One prompt per commit.
4. **Do not** wire the image into code. The game agent does that, behind an A/B, and judges it against the reference photos.

## House style (applies to every prompt)

- **Mood:** still, mysterious, cosy, tactile. Painterly realism, like a quiet matte painting. Soft edges, real light, no neon, no glow-lines, no sci-fi HUD.
- **References:** the six owner photos in `docs/reference/ponds/` (01 garden pond, 02 castle moat, 03 clear stone pool, 04 lily pond, 05 fog lake from the bank, 06 cattail marsh). Match their greens, stone and water. They are the truth.
- **Light:** four lights exist in the game: dawn (peach horizon, cool water), day (photo 01 greens), **dusk (the hero: violet zenith, ember horizon, deep teal water)**, night (moonlit teal). Unless a prompt names one, use **dusk**.
- **Palette anchors (sRGB):** dusk zenith `#34405f`, dusk horizon `#e0875b`, deep water `#263840`, far water `#1b2328`, moon `#c8c4b2`, accent gold `#c8a85c`.
- **Never:** text or lettering (unless the prompt asks), logos, watermarks, people, fishing brands, real place names or landmarks recognisable as a specific real site, anything from Zelda, Pokémon, Ghibli or Nintendo, fish anatomy close-ups.
- **Fish** appear only as **dark shadows under the surface**, never as visible fish. The game's whole idea is that you cannot see what is down there.

## The prompts

### 1. `splash`: title screen background
- **Deliver:** `public/images/the-waters-splash.webp` · **1290 × 2796** (iPhone portrait) · WebP quality 85
- **Prompt:** *A still pond at dusk seen from a low grassy bank, portrait composition. Rounded mossy stones line the near edge at the bottom of the frame. The water runs away from the viewer to a far shore of dark layered pines and maples. The sky is violet at the top, warming to an ember-orange band just above the treeline, with the sun just set behind the right side of the trees. The far water is dark and reflects the treeline. The near water is clear enough to see a single dark fish shadow just under the surface, slightly left of centre. Fine ripple on the surface, one long soft glint of the afterglow across the middle distance. Painterly realism, quiet matte painting, soft light, no people, no text. Leave the top third calm and uncluttered: the title is set over it in code.*

### 2. `icon`: app icon master
- **Deliver:** `public/icons/icon-1024.png` · **1024 × 1024** · PNG, opaque, no transparency
- **Then derive (any agent may do this with a script):** `public/icons/icon-512.png`, `icon-192.png`, `apple-touch-icon.png` (180), and `icon-maskable-512.png` with the subject inside the central 80% safe zone.
- **Prompt:** *An app icon: a single ripple ring spreading on dark teal water at dusk, seen from slightly above, with a faint dark fish shadow just beneath the ring. The ring catches a thin line of ember light. Deep teal to near-black gradient water, very simple, bold, readable at 60 pixels, centred, no border, no text, no glossy bevel.*
- **Why it matters:** iOS ignores SVG home-screen icons, so the game currently installs with a blank or screenshot icon.

### 3. `og`: link preview image
- **Deliver:** `public/og.jpg` · **1200 × 630** · JPEG quality 85
- **Prompt:** *Wide landscape view along a curving pond shoreline at dusk: a garden pond with rounded stones in the foreground, and further along the bank, glimpses of a castle moat wall, a lily pond with pads, and fog on a long lake in the distance, all one continuous shore. Violet sky, ember horizon, dark treeline, one long glint on the water. Painterly realism, calm, no text, no people. Keep the left 45% of the frame darker and simpler (a title is composited there).*

### 4–9. `water-01` … `water-06`: the six waters
One card per water, for the site and for the moment each water is discovered. **Deliver:** `public/art/waters/0N-<name>.webp` · **1080 × 1350** (4:5 portrait) · WebP quality 85. Each is painted **from its reference photo** (same composition and features), relit to the light named, in the house style, with **no visible fish** (at most one dark shadow).

| id | file | reference | light | prompt |
|---|---|---|---|---|
| `water-01` | `01-garden-pond.webp` | `docs/reference/ponds/01-garden-pond.jpg` | dusk | *A Japanese-style garden pond ringed by rounded lichen-spotted stones in the foreground, red-barked pines and maples behind, green-opaque water a few metres out, clear water at the stones with one dark fish shadow. Dusk light.* |
| `water-02` | `02-lily-pond.webp` | `04-lily-pond.jpg` | day | *A forest pond with islands of lily pads and reed beds on brown still water, a wooden fence and path along the left bank, a small pavilion roof far left, larch and broadleaf forest rising behind. Soft daylight.* |
| `water-03` | `03-stone-pool.webp` | `03-clear-stone-pool.jpg` | dawn | *A shallow, perfectly clear pool with a flagstone floor, a curving wooden boardwalk, a small waterfall over dark volcanic rocks at the back, a weathered stone guardian figure among the rocks (generic, not a specific deity or real shrine). Shadows of small fish on the stones. Early dawn light.* |
| `water-04` | `04-castle-moat.webp` | `02-castle-moat.jpg` | day | *A wide still moat beneath a white two-tier watchtower on a dark stone wall, rows of black pines along the far embankment, a mirror-calm surface reflecting tower and sky, strands of floating weed in the near water. Generic historic architecture, not a specific real castle; no modern buildings.* |
| `water-05` | `05-fog-lake.webp` | `05-fog-lake-pov.jpg` | dawn, fog | *A long narrow lake seen from a stone-edged concrete bank, cypress trees leaning in from both sides, thick fog sitting on the far half of the water, the near water dark green and still with a silver ripple path down the middle. No feet or people in frame.* |
| `water-06` | `06-cattail-marsh.webp` | `06-cattail-marsh.jpg` | dusk, wind | *A marsh pond with dark cattails in the foreground, wind ripples over blue water, a calm golden band along the far reeds, a drowned snag on the right, a cormorant drying its wings on a branch at left, autumn-tinted trees behind.* |

### 10. `treeline-01`: far shore layer for the home pond (A2)
- **Deliver:** `public/assets/textures/treeline-01.png` · **2048 × 512** · PNG **with transparency** (sky fully transparent)
- **Prompt:** *A horizontal strip of a far shoreline treeline seen across a pond at eye level: layered red-barked pines and soft maples, darker and more detailed in the front row, hazier behind, a mossy low bank at the very bottom. Neutral, evenly lit (no strong sun direction, no baked sky colour): the game tints it per light. Transparent background above and between the trees. Tileable left to right.*

## A5 prompts (the lily pond and the walk), added 24 Oct 2026

### 11. `legend-01`: a very large old fish, trophy plate
- **Deliver:** `public/assets/fish/old_mossback.webp` · **900 × 506** · WebP with **transparency**, matching the five existing plates in `public/assets/fish/` (side profile, head left, transparent background, moonlit palette).
- **Prompt:** *A side-profile trophy plate of an enormous, ancient pond carp, head to the left, on a transparent background. Its back is dark olive-bronze, its scales heavy and worn, with soft green weed growing along its back like moss, a torn fin edge, a pale scarred lip and old, calm eyes. Painterly realism matching the other fish plates: the same scale, lighting and soft moonlit shading. No text, no water, no background.*
- This is the only prompt that shows a fish as a fish: it is the catch card, not the pond.

### 12. `lilypads`: lily pad sprite sheet
- **Deliver:** `public/assets/sprites/lilypads.webp` · **1024 × 1024** · WebP with **transparency**, a 2 × 2 grid of four separate pads, each centred in its 512 × 512 cell, seen from directly above.
- **Prompt:** *Four individual water lily pads seen from straight above on a transparent background, arranged in a 2x2 grid with space between them: round leaves with a notch, muted green with brown-purple edges, one slightly torn, one with a small closed white bud, waxy surface with soft highlights. Evenly lit, no shadows, no water, no text.*

### 13. `treeline-02`: the lily pond's far shore
- **Deliver:** `public/assets/textures/treeline-02.png` · **2048 × 512** · PNG **with transparency** (sky fully transparent).
- **Reference:** `docs/reference/ponds/04-lily-pond.jpg` (the hillside behind the pond).
- **Prompt:** *A horizontal strip of a forested hillside seen across a pond at eye level: tall straight larches and spruce in the middle, a big round broadleaf tree on the left, a low wooden fence and a small pavilion roof far left, fresh spring greens, darker in the front row and hazier behind. Neutral, even light (the game tints it per light). Transparent sky above and between the trees. Tileable left to right.*

### 14. `old-sinker`: the found lure
- **Deliver:** `public/assets/sprites/old_sinker.webp` · **512 × 512** · WebP with **transparency**.
- **Prompt:** *An old hand-made brass fishing lure lying on its side, seen slightly from above on a transparent background: a heavy teardrop body, green verdigris in the grooves, a rusted hook, a short tangle of faded line. Small and precious-looking, like something found in the mud. Painterly realism, soft light, no text.*

### 15. `bench-wood`: weathered bench plank
- **Deliver:** `public/assets/textures/bench-wood.webp` · **1600 × 600** · WebP.
- **Prompt:** *A close-up, straight-on photograph-like painting of the top plank of an old wooden park bench by a pond: silver-grey weathered wood, deep grain, a few lichen spots, soft overcast light, filling the whole frame. Leave a calm, even band across the middle where words could be carved (do NOT carve or write any letters). No text.*
- The words are carved over it in code.

## Status

The live status of each prompt is in `/art/prompts.json`. As of 24 Oct 2026 all ten are `delivered`. Wired in: `icon`, `og` (as `public/og-title.jpg` with the title set over it), `splash`, `treeline-01` (as a WebP). Waiting for their chapters: the six water cards (water-02 is used in A5). The A5 prompts (11–15) are `wanted`.
