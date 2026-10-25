# AGENTS.md

**Author:** Adam Rappaport (Mentis), https://adamrappaport.vercel.app. Credit and links live in `src/lib/author.ts`; keep them on the title, every share and the About card (`docs/alpha/ATTRIBUTION.md`). Every social share ends with `#PlayTheWaters` (`src/game/share/hashtag.ts`).

This repo contains **The Waters** (working title until 24 Oct 2026: Reel Mobile), a mobile-first browser fishing game. Live: https://playthewaters.vercel.app.

**Art:** image prompts, sizes and delivery paths are in `public/art/PROMPTS.md` and `public/art/prompts.json` (served at `/art/PROMPTS.md`). Image agents deliver there; the game agent wires art in behind an A/B.

Before coding, read `docs/goalpack/00_OVERVIEW.md`, then `docs/goalpack/23_ALPHA_CANON.md` (the alpha canon; it wins over earlier goalpack files where they conflict).

## Priorities (in order)
1. Make the north-star paragraph in `00_OVERVIEW.md` happen on a real iPhone.
2. Mobile Safari playability over visual excess.
3. Fishing feel over feature count.
4. Vertical slice (Phase A) before horizontal expansion (Phase B).
5. Spotting/perception is core gameplay, not polish.
6. Tunable constants over hard-coded magic numbers.
7. Working build after every milestone.

## Tech defaults
- Next.js (App Router) + TypeScript
- React Three Fiber / Three.js (unless rejected per `17_RESEARCH_NOTES.md`)
- Zustand for game state, hand-rolled TS discriminated unions for state machines
- pnpm
- Vercel deploy target

## Rules
- **The owner reviews every chapter at https://playthewaters.vercel.app/ab** (owner's standing instruction, 24 Oct 2026: "always give me the new ab on that same url"). When a chapter is built, repoint `GATE` in `src/components/dev/AbGate.tsx` (chapter, title, baseline look, rounds, rubric) at the new chapter vs the previous one, **and rewrite its `reviewing` and `tryThis` so the page says what the owner is reviewing and what to do in both ponds** (owner: "make sure the ab is updated with what it is I'm reviewing"), keep the previous chapter reachable as a `?look=` baseline, and say in the hand-off that `/ab` is ready. Never move the gate to another URL. A chapter that adds features rather than a look (A4 onward, when it does) sets `MODE = 'review'` in `src/app/ab/page.tsx` and fills `REVIEW` in `src/game/tour/review.ts` (steps, the starred rubric checks as yes/no) **and writes the chapter's review tour in `src/game/tour/tours.ts`** (a stop per check: what to look at, what to point at, the scene to set; `docs/alpha/TOUR.md`), so `/ab` → Start the tour walks the owner through it inside the game; a look chapter sets `MODE = 'blind'`.
- Do not add scope from `docs/goalpack/14_DO_NOT_BUILD.md` as amended by `23_ALPHA_CANON.md` §8.
- Keep all feel constants in `src/game/tuning/tuning.ts`.
- Update `DEVLOG.md` after every milestone.
- Run validation from `docs/goalpack/12_VALIDATION.md` before declaring work complete.
- Commit and tag milestone candidates as `*-candidate`, and bump the tag in `next.config.mjs` `currentCandidateTag()` (the one source for `/dev` and playtest build labels). Only humans create `*-approved` tags.
- If the same validation fails twice, stop and document the issue in `DEVLOG.md` instead of guessing.
- If image generation is unavailable, continue Phase A with grey-box only and stop before Phase B.
