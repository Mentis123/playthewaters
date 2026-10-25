# The home screen: a proposal (not built)

*Written 25 Oct 2026 after the owner's note: "that main console page is really lame still… see the board or your fishing journal… pick and share some trophies… extending the viral content… a little note about the three finger tap." Nothing here is built until the owner picks.*

## What is there now

1. **Title** (the painted sunset pond, "The Waters", *six waters, one shore*): good, keep it.
2. **The second screen**: a dark card saying "Birb Labs Artefact / Build yours at Vibe Academy", two links and "Tap to start". It is a credit page standing where a home should be. It shows nothing of yours.
3. The pond.

The wall is behind a glyph on the pond and at `/wall`; the journal is at `/journal`, styled like a settings list. Neither is reachable from the start.

## The proposal: the second screen becomes the boathouse

One screen, in the world's own materials (the bench's grey wood, lamp-warm light, the painted water card of where you were), that answers three questions in order: **where am I going, what have I got, what can I show someone.**

### 1. Go fishing (the top, always)
- The painted card of the water you will start at (`/art/waters/0N-*.webp`) with its name and the light it is drifting toward: "the lily pond · toward dusk".
- One big **Go fishing** button. First-time players see only this and the credit line: the home pond is still the tutorial (canon §8: onboarding under 10 s).

### 2. The wall (yours)
- The board's top three lines, in the board's own style, tap to open the whole wall.
- Empty: "Nothing kept yet." Never a count of what is missing.

### 3. Trophies to share (the viral part)
- A shelf of your **best keeper per water** and anything **released that was a legend**, as small painted plates.
- Tap a plate: the **trophy card** (the existing catch card image, now with the water's painting behind the fish) and **Share**. It carries the catch link, so a friend lands on your pond at your light, and ends with `#PlayTheWaters`.
- **Share the wall**: renders the board itself as an image (portrait, story-sized) with a link to the game. A wall is a better brag than one fish, and it is still you against yourself (no leaderboard).

### 4. The journal, as a logbook
- The last five catches as a running logbook (date, water, light, fish, weight), not a list of rows. "Every catch" opens the whole book.
- Each line has the same Share.

### 5. Found (only what you found)
- The things you have found, each a small object on the shelf: the old sinking lure, the bench's line (tap to read it again). Nothing for what you have not found. No slots, no "2 of 6" (canon §5: no marker, no hint).

### 6. Bring someone
- The QR card inline (the same one three fingers bring up), with **Share the game** (`#PlayTheWaters`).
- The note: *"Three fingers anywhere, any time: this code, to show someone."*

### 7. The credit line (small, at the bottom)
- "A Birb Labs artefact · Vibe Academy · Mentis", one line, links intact. The Birb Labs treatment keeps its splash order; the credit stops being a page.

## Viral ideas, ranked (cheapest first)

1. **Every share is a door, not a picture.** Already true: catch links drop the friend on your pond. Make the trophy card and the wall card do the same. *Cheap.*
2. **Story-sized cards** (1080×1920) for Instagram/TikTok stories as well as the 4:5 card: the same art and words, laid out tall. *Cheap.*
3. **"Fish my pond" link**: share your pond itself (no catch), at your light, from the boathouse. *Cheap; reuses the catch link with no fish.*
4. **A 6-second clip of the landing** (the strike, the fight's last surge, the fish lifted), recorded from the canvas and shared as video. The Birb game already does this. *Medium; the most shareable thing on the list.*
5. **Pond of the day** (canon A10): "everyone is fishing the same pond today" is a reason for two people to compare notes. *Already planned for A10.*
6. **A challenge link** ("Can you beat my 49 lb bass on this pond?"). **Needs your call**: it is one person against one friend, not a leaderboard, but it is the closest thing to a score the canon allows, and it changes the mood from cosy to competitive.

## What it costs

- The boathouse screen: one route-level component over data that already exists (wall, journal, shore store, link builder, QR). About one chapter's worth of build and checks; no new art required, though a **boathouse wall texture** and a **lamp** would lift it (prompts can go to the art agent).
- Story-sized cards and "fish my pond": small additions to the existing card renderer and link code.
- The landing clip: a separate, larger piece (MediaRecorder on the canvas, iOS Safari has quirks); worth its own chapter.

## Questions for the owner

1. Name: **the boathouse** (proposed), the lodge, the hut, or none (just "home")?
2. Which viral pieces now: 1–3 (cheap), plus 4 (the clip) as its own chapter?
3. The challenge link (6): yes or no?
