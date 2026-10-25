# Attribution and the second screen (25 Oct 2026)

*Owner: "that [Vibe] Academy screen also probably needs some work? Or do we even just pull that out for now for a standalone game? You do need some way to make sure I get attribution and that it links back to me." Decision proposal; nothing built yet.*

## What is there now

Every launch: title → a full-screen "Birb Labs Artefact / Build yours at Vibe Academy" card (links: Vibe Academy, Mentis → X) → the pond. The card is the **Birb Labs artefact treatment** shared with Birb Mobile and Rogue Mobile (`birb/CLAUDE.md`), where the three games are teaching artefacts. The catch-link arrival card also carries "A Birb Labs artefact · Vibe Academy".

## The problem

The Waters is becoming a product people share with friends, not a classroom artefact. A full-screen credit page on **every** launch is a tax on the thing the canon protects most (onboarding under 10 s, the pond is the tutorial). Nothing on it is about the player. And the attribution it gives is to a school and an X handle, not to the person.

## Recommendation: pull the screen, keep the credit everywhere it counts

1. **Drop the mandatory second screen.** Title → one tap → the pond. (The tap still unlocks audio.)
2. **Title screen credit line**, small, under the tagline: **"Made by Mentis · A Birb Labs artefact"**, each a link. It is on the first thing anyone sees and on every screenshot of the title.
3. **An About card** in the tackle-bag panel (the pond's new home menu): the painted title, then *Made by Adam Rappaport (Mentis)* with links to **adamrappaport.vercel.app**, LinkedIn and X; *Learn to build things like this at Vibe Academy*; *A Birb Labs artefact*; and the three-finger note.
4. **Every outward surface carries the author:** the catch card and wall card footers ("playthewaters.vercel.app · by Mentis · #PlayTheWaters"), the DM previews' description ("by Mentis"), the catch-link arrival card line, `meta name="author"`, `humans.txt`, and the PWA manifest.
5. **Machine attribution** in the repo: `AGENTS.md`/`README` author line and a `LICENSE`/credits note, so forks keep the name.

## Where "back to me" should point

**The personal site, adamrappaport.vercel.app, as the one door.** Reasons:
- It is yours and it funnels to everything else (LinkedIn, X, Vibe Academy, consulting, the waitlist). One link you control beats three you don't.
- A player tapping "Mentis" expects a person's page. A LinkedIn link from a game reads as a résumé and dead-ends on a login wall for most phones.
- LinkedIn and X belong in the About card, one level down, where someone who wants to follow or hire you looks.

If the goal of a given share is professional reach (posting the game on LinkedIn yourself), the post is the LinkedIn surface; the game's own link should still go to your site.

## Family consistency

Dropping the screen here breaks the three-artefact treatment. Two ways to keep the family without the tax:
- **Recommended:** the credit line and About card above; Birb Mobile and Rogue keep their screens (they are artefacts first).
- Alternative: show the Vibe screen **once**, on the first launch only, then never again. Keeps the treatment, loses the tax. Weaker: first launch is exactly when the player should reach the water fastest.

## What it costs

Small: the title credit line and the About card are an afternoon beside the tackle-bag work; the footers and meta are an hour. No art needed.

## Open for the owner

1. Pull the screen, or first-launch-only?
2. Credit wording: "Made by Mentis", "Made by Adam Rappaport", or "by Adam (Mentis)"?
3. Keep "A Birb Labs artefact" on the title line, or only in About?
