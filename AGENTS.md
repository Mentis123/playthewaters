# AGENTS.md

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
- Do not add scope from `docs/goalpack/14_DO_NOT_BUILD.md` as amended by `23_ALPHA_CANON.md` §8.
- Keep all feel constants in `src/game/tuning/tuning.ts`.
- Update `DEVLOG.md` after every milestone.
- Run validation from `docs/goalpack/12_VALIDATION.md` before declaring work complete.
- Commit and tag milestone candidates as `*-candidate`. Only humans create `*-approved` tags.
- If the same validation fails twice, stop and document the issue in `DEVLOG.md` instead of guessing.
- If image generation is unavailable, continue Phase A with grey-box only and stop before Phase B.
