# DEVLOG

Append after every milestone. Format:

```
## vX.Y-name (YYYY-MM-DD)
**Shipped:**
- ...
**Cut:**
- ...
**Discovered:**
- ...
**Next:**
- ...
```

---

## v0.0-init (pending)
**Shipped:**
- Repo skeleton
- Goal Pack docs
**Cut:**
- N/A
**Discovered:**
- N/A
**Next:**
- M0: Next.js shell + Vercel deploy + `/dev` QR page

---

## v0.0-shell (blocked, 2026-05-03)
**Shipped:**
- Copied the active repo from the OneDrive path into native WSL at `/home/mentis/reelmobile` to avoid `#` path breakage in JS tooling.
- Drafted the M0 Next.js App Router shell, TypeScript config, pnpm manifest, Vercel config, `/`, `/game`, `/tune`, `/dev`, local IP API, QR-code dev gate, and manual checklist rendering.
- Added Node unit test and Playwright shell smoke test scaffolding.
- Passed `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` in `/home/mentis/reelmobile`.

**Cut:**
- No candidate commit or `v0.0-shell-candidate` tag was created because Layer 2 Playwright validation did not pass.
- Milestone 1 was not started.

**Discovered:**
- The original project path `/mnt/c/Users/Adam Rappaport/OneDrive - DATA#3 LIMITED/Fishing/reelmobile` breaks tooling that treats `#` as a URL fragment. In that path, Vitest could not resolve Vite internals and Next production builds failed in both output tracing and the React Client Manifest.
- Native WSL path fixes the Next production build.
- `pnpm test:e2e` failed first because Playwright WebKit was not installed.
- After installing WebKit, Playwright reported missing WSL host libraries and `pnpm exec playwright install-deps webkit` failed because sudo requires an interactive password.
- A Chromium mobile-viewport fallback also failed because the WSL host is missing browser libraries (`libnspr4`, `libnss3`, `libasound2t64`).
- This is the second failure of the M0 Playwright validation check, so work stopped per `12_VALIDATION.md`.

**Next:**
- Human review required. Install Playwright browser dependencies in WSL with sudo, then re-run M0 validation from `/home/mentis/reelmobile`.
- Suggested command: `sudo pnpm exec playwright install-deps`

---

## v0.0-shell-candidate (2026-05-03)
**Shipped:**
- Next.js App Router + TypeScript + pnpm scaffold in native WSL path `/home/mentis/reelmobile`.
- Vercel-ready `vercel.json`, Next config, lint/typecheck/test/build scripts, and lockfile.
- `/`, `/game`, `/tune`, and `/dev` routes.
- `/dev` shows local network URL, QR code, current candidate tag, M0/M1 manual checklists, and a copyable human approval command.
- M0 validation passed: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.

**Cut:**
- `/game` and `/tune` remain placeholder routes until M1, per M0 scope.
- No `*-approved` tag was created.

**Discovered:**
- The OneDrive path containing `#` is unsafe for this Next.js toolchain; native WSL path is required for reliable builds.
- WebKit Playwright works after human-installed WSL browser dependencies.
- Next dev server can trigger reloads during first route compilation, so the shell smoke test opens each route in a fresh page.

**Next:**
- M1 vertical slice: grey-box pond, casting, lure, fish cues, rope line, bite/fight/failure loop, procedural audio, telemetry hooks, debug HUD, and `/tune` constants.

---

## v0.1-vertical-slice (blocked, 2026-05-03)
**Shipped:**
- Drafted the M1 grey-box vertical slice locally: `/game` mounts a mobile-first R3F pond with fixed camera, dock, water plane, fish shadow cue, lure, drag/release casting, dotted preview, Verlet line, rod bend, debug HUD, WebGL context handlers, procedural Web Audio, telemetry hooks, session store, and result copy.
- Added `src/game/tuning/tuning.ts` and moved gameplay feel constants there.
- Added hand-rolled TypeScript game and fish discriminated unions.
- Added `/tune` constant browser sourced from `tuning.ts`.
- `pnpm typecheck`, `pnpm lint`, and `pnpm build` passed after fixing the App Router Suspense boundary.

**Cut:**
- No M1 commit or `v0.1-vertical-slice-candidate` tag was created because Layer 2 Playwright validation did not pass.
- No Phase B work was started.
- No remote push succeeded; HTTPS git credentials are not configured in WSL and the installed `gh` binary is not executable in this environment.

**Discovered:**
- First M1 `pnpm build` failed because `/game` used `useSearchParams()` without a Suspense boundary. Fixed and reran successfully.
- First M1 `pnpm test:e2e` failed because WebKit touch did not synthesize the splash button click while root touch protections were active. Added pointer-down unlock handling and reran.
- Second M1 `pnpm test:e2e` failed because the SVG rod path hydrates differently on server and client: server path rendered as `M 0 0 Q 0 0 0 0`, client path rendered from real viewport dimensions.
- This is the second failure of the M1 Playwright validation check, so work stopped per `12_VALIDATION.md`.

**Next:**
- Human review required before another M1 validation attempt.
- Likely fix: defer the SVG rod/line overlay render until after client mount or store viewport dimensions in React state initialized after hydration.
- Configure GitHub push credentials in WSL via working `gh auth login` + `gh auth setup-git`, or switch `origin` to SSH after adding an SSH key to GitHub.

---

## v0.1-vertical-slice-candidate (2026-05-03)
**Shipped:**
- Mobile-first `/game` vertical slice with Tap-to-begin audio/session unlock, iOS touch protections, fullscreen/orientation attempts, and portrait overlay.
- Grey-box R3F pond with 3D water plane, dock, fixed camera, ambiguous fish shadow, periodic real/false ripple cues, lure splash/sink/twitch, drag/release casting, dotted preview, and 10-segment Verlet line.
- Hand-rolled TypeScript game and fish discriminated unions, tension system, rod bend, line colour/width changes, high-tension ripple/splash intensity, bite window, hook success, missed early, missed late, snap, escape, catch, and story result screen.
- Procedural Web Audio implementation for ambient, cast, plop, twitch, nibble, hook, zip, reel, splash, snap, catch, and escape events.
- Telemetry `track()` hook wired to session start, cast, bite, hook attempts, catch, failures, WebGL context loss/restore, and pixel-ratio degradation.
- Debug HUD toggled by `?debug=1` or two-finger tap showing FPS, draw calls, triangles, texture count, heap, game/fish/lure state, tension, seed, and pixel ratio.
- `/tune` page browses hot-reloadable constants from `src/game/tuning/tuning.ts`.
- WebGL context loss/restore handlers and pixel-ratio degradation logic.
- M1 validation passed: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.

**Cut:**
- Final art, generated assets, multiple species, journal, share cards, PWA polish, accounts, economy, upgrades, day/night, weather, and Phase B scope.
- Real iPhone feel approval. Agent created only the candidate tag; human review remains required.

**Discovered:**
- The initial M1 hydration mismatch came from server-rendering viewport-projected SVG rod geometry. Deferring viewport-projected overlay render until after client mount fixed it.
- WebKit tap synthesis is sensitive to root `touchstart.preventDefault()`. The splash gate now starts on pointer/click and root touch prevention skips the splash button so the first tap reliably dismisses.
- The `/game` first-load JS is about 311 kB, comfortably under the M1 bundle budget.

**Next:**
- STOP for human review on a real iPhone through `/dev` QR.
- Human should use the 10-question Phase A checklist and create `v0.1-vertical-slice-approved` only if the real-iPhone test scores at least 8 of 10.

---

## Phase A human review feedback (2026-05-04)
**Tested:**
- URL: `https://reelmobile.vercel.app`
- Device/browser: iPhone 16 Pro, iOS 18.7, Chrome on iOS.
- Score: about 5/10 on the Phase A checklist.

**Shipped:**
- First-tap comprehension, casting, fish cue visibility, bite clarity, learnable failure, and story result are partially or fully working.
- Latest tested build includes post-candidate remote fixes for bite/reel feedback, cast-again reset, sharper bite cue, surfaced fish shadow, and smaller bite halo.

**Cut:**
- No approval tag was created.
- No Phase B work should begin.

**Discovered:**
- Fish cue is visible, but the fish shadow does not correlate with bite reality; lure-near-fish reaction feels disconnected.
- Bite clarity is currently carried by explicit `Tap!` and red ring UI. Desired direction is less permanent training UI and more lure tugging/physical motion.
- Hooking is legible because the tension HUD appears, but it does not yet feel decisive.
- Fight tension reads mostly as HUD; line color shift is not enough to communicate load through the line itself.
- High-tension/reel audio becomes staticky and unpleasant. Desired direction is clicky reeling noise that only escalates near peak tension.
- The loop is not yet connected enough to feel like a lived fishing moment or strongly invite repeat casting.
- Cast preview currently projects from the touch point instead of the rod/casting point.
- Cast preview can imply dock-distance reach that the actual cast does not achieve, creating a mismatch between aim preview and landing result.

**Next:**
- Treat the next candidate as an M1 feel-repair pass, not Phase B.
- Prioritize spatial truth: fish cue, lure, bite origin, reaction, and cast preview should describe the same underlying world state.
- Prioritize physical feel over HUD: hook impact, lure tugging, line load, rod bend, and audio should communicate the loop before UI labels do.

---

## M1 feel-repair pass (2026-05-04)
**Shipped:**
- Synced local `main` to the Claude-fixed remote `main` before making new changes.
- Cast preview now starts from the rod tip and ends at the same computed/clamped world target the lure will use on release.
- Fish cue is now an oval shadow that grows more visible during commit/bite states.
- Bite now creates paired fish/lure ripples and physically tugs the lure during the bite window.
- Successful hook now adds a short rod/line jerk, lure jerk, and paired ripples to make the hookset feel more decisive.
- Reel audio now uses softer click-led feedback, with line strain only rising near high tension instead of a harsh low-threshold sawtooth.
- New feel constants were added to `src/game/tuning/tuning.ts`.

**Cut:**
- No Phase B work.
- No approval tag.
- No new candidate tag yet; this pass should deploy from `main` for another real-device feel review first.

**Discovered:**
- Running `pnpm typecheck` concurrently with `pnpm build` can race against regenerated `.next/types` and produce transient missing generated-file errors. Serial rerun after build passes.

**Next:**
- Test the deployed `main` again on iPhone 16 Pro / iOS 18.7 / Chrome on iOS against the same 10-question checklist.
- Pay special attention to items 3, 4, 6, 7, 8, and 10.
- If this feels closer, decide whether to tag a new `v0.1.x-*-candidate` for formal human review.

---

## M1 real-device bugfix pass (2026-05-04)
**Shipped:**
- Recorded iPhone 16 Pro / iOS 18.7 / Chrome on iOS feedback with screenshot showing lure/line state after repeated taps.
- Missed-late bite flow now resolves to an explicit miss result instead of silently returning to casting.
- Touching during the late-bite grace window now resolves the late miss instead of beginning another cast.
- Repeated lure twitch taps are clamped to fishable water so the lure cannot walk up onto the dock.
- Cast targets are clamped to the same fishable-water bounds as lure twitching.
- Rope visual tension now stays slack longer and only pulls straight near high tension.
- Reel audio uses the earlier click/noise character again while keeping continuous line strain gated to high tension.

**Cut:**
- No Phase B work.
- No approval tag.
- No pole-drag lure manipulation yet.

**Discovered:**
- The cast/twitch input model still conflates screen touch intent: tap-to-twitch, drag-to-cast, and future rod manipulation need clearer separation.
- The desired future mechanic is likely rod-tip manipulation after the lure is in water, where dragging the rod/pole changes line load and pulls the lure without recasting.

**Next:**
- Retest deployed `main` on the same iPhone/Chrome setup.
- Evaluate whether late misses now feel learnable and whether line slack/tautness better communicates the happy tension range.
- Consider a later M1 input refinement: touch the rod/handle to manipulate rod tip, touch water/drag from idle to cast.

---

## M1 result/audio clarity pass (2026-05-04)
**Shipped:**
- Result overlay no longer dismisses from tapping anywhere on the card.
- Result dismissal is locked for `TUNING.timing.resultDismissLockMs`, then only the `Cast again.` button can reset.
- Catch result copy now starts with `Caught.`; failure result copy starts with `Missed.`, `Lost.`, or `No fish.`.
- Splash begin now triggers from pointer release/click instead of pointer down and plays an immediate confirm tone after Web Audio unlock.
- Ambient pond noise is louder and less flat so audio should be present immediately after unlock, before the first bite.

**Cut:**
- No Phase B work.
- No approval tag.

**Discovered:**
- Tapping to reel makes accidental result-card dismissal likely unless the card ignores non-button taps.
- iOS Chrome audio unlock is more reliable when the splash action completes on release/click rather than pointer down.

**Next:**
- Retest deployed `main` on iPhone 16 Pro / iOS 18.7 / Chrome on iOS.
- Confirm audio is audible immediately after the splash tap and that catch/failure outcomes are unambiguous.

---

## M1 catch/snap race fix (2026-05-04)
**Shipped:**
- Catch outcome now wins cleanly if landing and snap threshold happen on the same frame.
- Result handling is idempotent so a second outcome cannot overwrite or add audio after the first result.
- Result handling stops line/reel loops before playing catch/failure sounds and resets stored tension to zero.

**Cut:**
- No Phase B work.
- No approval tag.

**Discovered:**
- At the catch/snap boundary, high-tension audio could leak into an otherwise successful `Caught.` result.

**Next:**
- Retest one final deployed build and, if the real-device checklist is good enough, call M1 complete for this candidate cycle.

---

## Phase A human testing complete (2026-05-04)
**Shipped:**
- Phase A M0 shell and M1 vertical slice candidate cycle completed with repeated real-device testing on iPhone 16 Pro / iOS 18.7 / Chrome on iOS.
- Final repair pass resolved the reported catch/snap audio race before closing the session.
- Repo is ready for a fresh session and next goal context after this pass is pushed.

**Cut:**
- No Phase B work.
- No human `*-approved` tag was created in this agent session.

**Discovered:**
- The core M1 loop is good enough to stop this candidate cycle and move planning/work into a new session.

**Next:**
- Start a new session with the next explicit goal.
- Use this DEVLOG and latest `main` as the starting point.

---

## v0.1.5-rod-control-candidate (2026-05-04)
**Shipped:**
- Synced `main` after `v0.1-vertical-slice-approved` and stayed inside Phase A feel refinement; no Phase B art started.
- Added post-cast rod/handle touch detection that enters `rod_control` instead of recasting.
- Split post-cast water input so taps twitch, rod drags manipulate the rod, and water drags still cast only after movement intent is clear.
- Rod-tip manipulation now bends/moves the rod, raises line load, pulls the lure through the water, flashes the lure, and feeds the existing tension visuals.
- Slack/sweet/danger feedback now reads through line colour/width, rod bend, tension bar, lure motion, and click/strain audio thresholds.
- `/dev` now exposes an M1.5 rod-control real-iPhone gate with checklist items targeted at rod manipulation and tension readability.
- Added Playwright smoke coverage for drag-release cast followed by rod-control drag returning to `lure_idle`.
- M1.5 validation passed: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.

**Cut:**
- No Phase B art, generated assets, new fish species, gear systems, journal, economy, or onboarding UI.
- No approved tag. Human iPhone review remains the gate.

**Discovered:**
- The approved loop already had enough tension plumbing to reuse for rod load; the main ambiguity was input intent, not another UI layer.
- Starting post-cast touches as pending intent avoids accidental recast/twitch ambiguity without removing water-drag recasting.
- Candidate metadata is injected in both `buildInfo.ts` and `next.config.mjs`; both must move together or `/dev` can show stale candidate data.
- Adding `m1.5` as a distinct milestone requires an explicit checklist entry; otherwise `/dev` falls back to M0.

**Next:**
- STOP for human iPhone review through `/dev` QR.
- Review whether dragging the visible rod/handle feels like pulling the lure, and whether slack/sweet/danger can be read before looking at the HUD.
- Human may create an approved tag only after real-device review passes.

---

## v0.1.5-hook-guard-candidate (2026-05-04)
**Shipped:**
- Guarded bite-window hook taps so a small finger move cannot promote the touch into a recast before pointer-up.
- Kept post-cast water drag recasting available only while the lure is idle and outside late-hook handling.
- Updated candidate metadata for `/dev` to point at the hook-guard follow-up candidate.

**Cut:**
- No Phase B art.
- No approved tag. Human review remains required for the final M1.5 follow-up.

**Discovered:**
- The recast-on-hook issue came from the pending post-cast touch path promoting movement to `aiming` without checking that the current state was still `lure_idle`.

**Next:**
- Recheck on iPhone that bite-window taps set the hook even with normal thumb drift, and that deliberate water drags still recast after the lure is idle.
- If that passes, human may create the approved tag for this follow-up before starting Phase B.

---

## v0.2-pond-candidate (2026-05-04)
**Shipped:**
- Started from latest `main` after human `v0.1.5-hook-guard-approved`.
- Added M2 core assets under `public/assets`: water normal texture, dock plank texture, generic fish sprite, default lure sprite, and SVG wordmark.
- Replaced grey-box water with a lightweight custom shader using depth fade, broad moonlight glints, normal-map ripples, and Focus-mode glare reduction.
- Replaced grey-box dock/fish/lure visuals with textured dock planks and transparent sprite planes while preserving the existing single-fish gameplay loop.
- Added instanced low-poly reeds, a painted far-bank card, and M2 `/dev` checklist/candidate metadata.
- Added press-and-hold Focus Water behavior using tunable constants in `src/game/tuning/tuning.ts`.
- Added M2 Playwright visual smoke coverage with mobile and portrait-desktop screenshots plus canvas pixel sampling.
- M2 validation passed: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.

**Cut:**
- Fish variety, gear variants, journal, economy, progression, map, weather, audio replacement, new systems, and any `14_DO_NOT_BUILD.md` scope.
- No `*-approved` tag. Human iPhone review remains the gate.
- Decorative art remains deliberately light: no extra rocks, particles, weather, or expanded environment detail.

**Discovered:**
- Running multiple WebKit canvas tests in parallel made the tap smoke flaky, so Playwright now runs the mobile Safari smoke project with one worker.
- The sandbox can report port 3000 as occupied without a visible `next dev` process after interrupted manual runs; Playwright now uses port 3001 to avoid that collision.
- The generated asset payload is small, about 68 KB total for M2 assets, and the scene stays within debug budget in automated smoke: 10 draw calls, 2,784 triangles, and 4 textures.
- Automated visual checks can prove the canvas is nonblank and framed, but they cannot judge whether the pond feels good on a real iPhone.

**Next:**
- STOP for human iPhone review through `/dev` QR.
- Review the M2 checklist on a real iPhone: visual coherence, iPhone 13 60fps target, Focus glare reduction, reed/dock/water palette fit, and preservation of the full fishing loop.
- Only a human may create `v0.2-pond-approved` after real-device review passes.

---

## v0.2-pond-illusion-candidate (2026-05-04)
**Shipped:**
- Addressed M2 human review feedback without adding new fish, gear, journal, economy, progression, map, weather, or systems.
- Moved water ripples from screen-space HTML rings into 3D ring meshes on the water plane so they inherit camera perspective.
- Recolored ripple cues from UI gold to moonlight/grey so surface disturbance does not read like HUD.
- Added a simple visual reel to the existing rod overlay; this is presentation only, not a gear variant.
- Increased the single generic fish patrol area and wander speed so it no longer lives in one obvious spot.
- Made fish shadow/cue visibility fade by pond depth and lowered base fish cue opacity so deeper water hides fish better.
- Enlarged and brightened the default lure sprite so it is readable after cast while preserving sink/twitch behavior.

**Cut:**
- Full strategic depth gameplay, lure-depth targeting, sonar-like visibility, fish variety, gear mechanics, and any roadmap expansion outside M2.
- No approved tag. Human review still owns approval.

**Discovered:**
- The previous screen-space ripple layer broke the pond illusion because it ignored the fixed camera angle.
- Fish perception needs depth-dependent visibility even before deeper depth strategy exists.
- Current lure sink is a vertical visual/feel component, not yet a strategic water-column system.

**Next:**
- STOP for human iPhone review through `/dev` QR.
- Specifically recheck ripple perspective, lure readability, fish cue subtlety, fish wandering breadth, rod/reel readability, and whether the pond still passes the M2 visual checklist.
- Consider depth-as-strategy in a later explicit milestone only after the pond visual gate is approved.

---

## v0.2-line-entry-fix (2026-05-04)
**Shipped:**
- During a hooked fight, reeling now pulls the fish/lure contact point toward the nearest fishable water under the rod so the line entry point closes distance.
- Kept the pull target clamped to fishable water so the fish does not slide under the dock.
- Added the reel contact pull speed to `src/game/tuning/tuning.ts`.

**Cut:**
- No new depth strategy, fish systems, gear variants, or roadmap expansion.
- No approved tag was created by the agent.

**Discovered:**
- The fight previously drained stamina but did not visually shorten the water-side line endpoint enough while reeling.

**Next:**
- Human may create the approved M2 tag locally after final live/prod check.

---

## v0.3-fish-variety-candidate (2026-05-04)
**Shipped:**
- Started from latest `main` at human `v0.2-pond-approved`.
- Added five seeded fish species by silhouette and behavior only: Bronze Carp, Moss Bass, Moon Minnow, Old Kingfish, and Reed Pike.
- Added per-instance `personality: -1..1` and applied the required +/-15% modulation to notice radius, fear radius, and bite/commit feel through species tuning.
- Added seeded spawn distribution so each cast advances the deterministic fish instance stream without increasing pond density.
- Added per-species cue signatures: bubbles for Carp, glints for Bass, surface rises and tail flashes for Minnow, silt for Kingfish, and wakes for Pike, while preserving seeded false cues.
- Updated catch/failure session context and result stories to record the active species after the encounter.
- Updated `/dev` candidate metadata and manual checklist for the M3 real-iPhone gate.
- M3 validation passed: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.

**Cut:**
- No labels over fish while scouting, rarity UI, journal, gear variants, economy, progression, extra ponds, weather, or other `14_DO_NOT_BUILD.md` scope.
- No new raster fish assets; silhouettes reuse lightweight sprite scaling and low-cost surface cue meshes to protect Mobile Safari performance.
- No `*-approved` tag. Human review remains required.

**Discovered:**
- The approved one-active-fish loop is the right density for M3; adding simultaneous fish would risk crowding the pond and weakening perception.
- Species variety fits cleanly as tuning plus a small species layer, without replacing casting, rod control, bite, fight, failures, debug HUD, `/dev`, or `/tune`.
- Automated smoke can verify the loop still renders and plays, but only real-iPhone review can judge whether five silhouettes and cue signatures read distinctly.

**Next:**
- STOP for human iPhone review through `/dev` QR.
- Review the M3 checklist: five silhouettes, distinct cue signatures, same-species personality differences, fish density, and preservation of the M1/M2 fishing loop.
- Only a human may create `v0.3-fish-variety-approved` after real-device review passes.

---

## fix-fishing-game-yczS4 (pending)
**Shipped:**
- Switched the fishing line and rod tip overlay from a top-down `worldToScreen` approximation to a real `THREE.Camera.project` projection so the line endpoint visually matches the 3D lure mesh.
- Locked `lurePos` exactly to `fish.position` while hooked so the lure stays glued to the fish during the reel-in.
- Fish silhouette now slerps toward the heading derived from its velocity (with a `fishFacingMinSpeed` floor and `fishFacingTurnRate` for smoothing) so it always swims forward instead of moonwalking.
- Anchored the rod butt + reel to a fixed viewport-relative screen position (`rodScreenButtXRatio`, `rodScreenButtBottomMarginPx`) so the whole reel setup is visible inside Mobile Safari's chrome.
- Redesigned the rod stroke with a brown-to-gold gradient and redrew the reel as a layered hub + crank handle; the fishing line is now hidden during scouting/aiming/result so the idle pole no longer sports a white whisker on the tip.
**Cut:**
- No new physics for catenary sag — the verlet still runs in 2D `(x, z)` and we only add a sin-shaped y-axis sag at projection time.
**Discovered:**
- The previous `worldToScreen` projection was the root cause of every "line ends in the wrong place" bug; aim-preview dots still use it but they tolerate the offset.
**Next:**
- Real-device iPhone review of: (a) line/lure alignment during cast and fight, (b) fish heading through wander/inspect/flee, (c) full reel visibility under Safari's bottom toolbar, (d) idle pole presentation.

---

## fix-fishing-rod-casting-2rWqS (pending)
**Shipped:**
- Re-centered the rod butt anchor from the bottom-right corner (`rodScreenButtXRatio: 0.78`) to bottom-middle (`0.5`) and brought it closer to the bottom edge (`rodScreenButtBottomMarginPx` 86 → 36) so the rod reads as a near-vertical first-person fishing pole instead of a diagonal stick floating from the corner.
**Cut:**
- No code restructuring — purely a tuning tweak; the screen-anchored butt + camera-projected tip pipeline from the prior candidate stays intact.
**Discovered:**
- The corner anchor + camera-projected tip combo created a long diagonal "rod from nowhere" silhouette; even though the line endpoint still met the rod tip exactly, the eye read the rod as detached from the scene and from the line.
**Next:**
- Real-device iPhone review: confirm the centered rod silhouette reads as held by the viewer, the reel/handle still sit comfortably above the bottom safe area, and the line continues smoothly off the rod tip during cast/fight.

---

## M3 human review feedback (2026-05-12)
**Tested:**
- URL: `https://reelmobile.vercel.app` after M3 candidate ship.
- Score: M3 checklist failed on silhouettes, personality, and fight feel.

**Discovered:**
- Five species couldn't be told apart by silhouette: shared `fish_generic.webp` sprite at five scales, not five distinct body shapes.
- `personalityModulation: 0.15` was too small to notice; same-species and cross-species encounters felt indistinguishable.
- Fight had no resistance: stamina drained smoothly during reeling with no fish-initiated surge against the player, so "I panicked. I nearly snapped the line" couldn't happen.
- Density (one active fish + paired cue layers) reads OK; not changing the spawn model.

**Next:**
- Treat as M3.1 feel-repair, not Phase B.
- Distinct silhouettes per species, stronger personality plumbing, fish-initiated fight surges, sharper cue signatures.

---

## v0.3.1-fish-feel-candidate (2026-05-12)
**Shipped:**
- Per-species silhouettes generated procedurally as CanvasTextures inside the scene; each species mesh now binds its own body shape (carp deep-bodied, bass mid-stocky, minnow small/forked, kingfish long+broad with twin fins, pike long+narrow with rear dorsal). No new raster assets.
- Personality scalar plumbing: `personalityModulation` 0.15 → 0.42, `personalityScalar` 0.08 → 0.18, and a new `personalityHesitation` curve modulates notice/inspect/commit/flee durations so cautious vs. bold fish read in timing as well as radius. Flee direction now uses personality and position sign.
- Fight surges: per-species `surgeInterval{Min,Max}Ms`, `surgeTensionSpike`, and `surgeAudioIntensity`. Pike surges hard and often; Kingfish surges deep and slow; Minnow flicks; Carp/Bass sit in between. Each surge spikes tension, boosts the fish's `rage`, plays a splash, and vibrates a new `fishSurge` haptic. Personality bias scales surge cadence.
- Rage decay during `hooked`: rage relaxes toward a personality-shaped baseline between surges so the fight modulates instead of holding constant.
- Stamina drain reduced (0.15 → 0.1) so the fight lasts long enough for surges to land.
- Sharper cue signatures: real-cue peak opacity 0.48 → 0.62, glint/tail-flash hold roughly doubled (`cueFlashDurationMultiplier` 0.18 → 0.32), silt opacity 0.58 → 0.78 of real-cue base, bubble trail bead count 3 → 4.
- `/dev` page exposes an `m3.1` checklist focused on body shape, surge feel, and personality variance.
- Candidate metadata (`buildInfo.ts`, `next.config.mjs`) advanced to `v0.3.1-fish-feel-candidate`.

**Cut:**
- No concurrent fish; spawn density unchanged. The one-active-fish + cue-layer perception model from M3 stays.
- No new raster art, no rarity/labels, no journal, no gear variants, no Phase B scope.
- No `*-approved` tag.

**Discovered:**
- Single shared sprite scaled by species was the dominant cause of "all fish look the same"; pushing more variance through the same plane never reads at a glance.
- Personality modulation under 0.2 is sub-threshold for a player making a 5–10 second judgement call. 0.4+ becomes a visible signal.
- Pure stamina drain produces no panic. Periodic fish-initiated tension spikes are what give "I nearly snapped the line."

**Next:**
- STOP for human iPhone review through `/dev` QR.
- Review the M3.1 checklist: silhouette legibility, cue clarity, same-species variance, surge feel during fight, loop preserved.
- Only a human may create `v0.3.1-fish-feel-approved` after real-device review passes.

---

## v0.3.1-fish-feel reconciled onto remote main (2026-05-12)
**Shipped:**
- Rebased the M3.1 candidate (silhouettes, personality plumbing, surges, sharper cues) onto `origin/main` at `b260f50` so it stacks on top of the 16 in-flight PRs that landed during the candidate cycle: PWA service worker, multi-fish + depth-fade, foreshore terrain, foreshore-gated fish, result-card freeze, linear cast drag, smaller rod, lure drift on rod-release, fish-wide pond roam, camera-projected line, and screen-anchored rod butt.
- Merged conflicting `tuning.ts` fish block by keeping M3.1's `personalityModulation: 0.42` + new personality/surge/rage constants AND the new `fishFacingMinSpeed`/`fishFacingTurnRate` from the rod-position PR.
- Merged `fleeTarget` (fishStateMachine.ts) by keeping M3.1's personality-biased x reach AND HEAD's `fishableMaxZ` z-clamp.
- Re-applied per-species silhouettes, surge scheduling, and sharper cue parameters into the GameClient rewrite landed by the PRs (camera projection, fixed rod anchor, multi-fish pool).

**Cut:**
- No new Phase B scope; no journal, gear, or rarity work added during reconciliation.

**Discovered:**
- The remote PRs partly overlap M3.1 territory: multi-fish (1–3 same-species, with depth fade) is now in place independently of M3.1's silhouette/personality work, so silhouette variety + same-species personality variance now apply across the small visible pool instead of just one active fish.
- PWA scope (M7) landed early via PR #16; the next planned milestones can lean on that.

**Next:**
- STOP for human iPhone review through `/dev` QR against the M3.1 checklist plus a sanity check that the PR work (PWA install, multi-fish density, foreshore framing, rod anchor) still feels right.

---

## v0.3.2-pond-polish-candidate (2026-06-01)
*Out-of-band visual-polish pass on the pond — not a Phase B milestone. First candidate built under the ratified ultracode amendment (`18_ULTRACODE_PARADIGM.md`): machine-checkable wiring self-verified by static artifact (greps below); feel/colour read is the canary and is deferred to the human iPhone gate. Co-tuned starting values are my best guess per "build my best co-tuned guess" — both directions are for the human to judge on glass.*

**Shipped:**
- **Deepened the pond water, co-tuned with fish opacity (the headline change).** New `TUNING.visual.waterDeep` `#2b4750` / `waterShallow` `#4a6f6a` — roughly halfway from the old `#3d6068`/`#6a958f` toward the `08_ART_DIRECTION` bible `#1a2b30`/`#2f4948`. *Partway, not all the way:* at full art-bible depth a near-black fish silhouette vanishes. To hold the read, `world.fishCueOpacity` nudged 0.40 → 0.46 in the **same diff** (recovers ~half the silhouette contrast the darker water costs; deep/shallow fade multipliers unchanged). The shader uniforms (`GameClient.tsx` `uDeep`/`uShallow`) now consume `TUNING.visual.*` and are **decoupled** from the `--water-deep`/`--water-shallow` `:root` CSS tokens, which still paint the loading screen, result card and tune page in the original teal.
- **Separated the water from the void.** Background and fog were *both* `#3d6068` — byte-identical to the old water, which is exactly why the pond dissolved into its surround. Pushed to `TUNING.visual.voidColor`/`fogColor` `#101c20` (ink). `fogNear`/`fogFar` lifted (10/18, unchanged).
- **Tamed the caustics.** `uCaustic` lifted to `TUNING.visual.causticStrength` and dropped 0.5 → 0.32; new `causticFocusMultiplier` 0.35 collapses them under Focus (`mix(1.0, uCausticFocusMul, uFocus)`); band weighting flipped from shallow-biased (`0.35 + 0.65*shallowW`) to deep-biased (`0.3 + 0.55*depth`) so the busy filaments leave the fishable foreground alone. `shallowW` removed (now dead).
- **Removed the stone lantern** from the treeline backdrop — it "echoed the reference statue," a `14_DO_NOT_BUILD` breach. The full-width mossy bank painted underneath already covers that stretch of waterline, so removal leaves no notch; no replacement mesh added.
- **Kept the backdrop seam closed.** The treeline sky's waterline stop and the waterline-mist gradient now *track* `TUNING.visual.waterDeep` (sRGB-safe hex parse, single source of truth) instead of the old hardcoded `#3d6068`/`rgb(61,96,104)`, so the backdrop base still melts into the (now deeper) far water.
- **Lifted placement constants for the /dev gate** (values unchanged): `backdropY` 0.8, `backdropTilt` 0.12, `treelineVisibleTop` 0.4 → `TUNING.visual.*`.
- Net cost: colour/constant/canvas-paint only. Zero new geometry, draw calls, textures, or rasters; the fragment shader gains one `mix()` + one multiply (negligible). No bloom/post, no new `.webp`.

**Cut / deferred (named so the gate knows what it's *not* getting):**
- `08_ART_DIRECTION` reed recolour — cut.
- Foreshore tint — deferred.
- The `fog={false}` toggle on the backdrop material (`08`/seam #6) — **deferred to the human**: only the *mist colour tracking* is shipped, not the toggle.
- Blind backdrop re-tuning — cut; only the *lifting* of placement constants ships, not new values.
- The far-shore parallax plate — still deferred.

**Discovered:**
- Background and fog literally shared the old water's hex (`#3d6068` × 3). The "void doesn't separate from the water" complaint wasn't subtle atmospherics — it was the same colour painted three times.
- The shader's water colours were *already* separate literals from the `:root` tokens (not shared), so decoupling was a rename to `TUNING.visual.*`, not a refactor — the loading screen was never at risk of darkening once the shader stopped reusing the same hex by hand.
- Deepening water and fish opacity are not independent knobs: a near-black silhouette over deep teal loses contrast fast, so they have to move together or the gate fails on "where did the fish go."

**Verification (machine-checkable, self-certified per amendment §3):**
- Static artifact sweep: no leftover `#3d6068`/`#6a958f`/`rgb(61,96,104)` in `GameClient.tsx`; the only surviving copies are the `:root` tokens + PWA `themeColor` (intended); all 11 `TUNING.visual` keys defined exactly once; `uCausticFocusMul` present in all three sites (JS uniform, GLSL decl, GLSL use); shader internally consistent (`causticBand`/`depth`/`uFocus`/`caustic` all in scope); no orphaned lantern vars.
- `pnpm build` is **not** run locally (standing "never test locally" rule); Vercel's build is the §3.1 executor for typecheck/lint/build.

**Next — the human iPhone gate (canary concerns, non-delegable):**
- **Water-vs-fish contrast, judged *both* directions:** are fish still a shadow you have to *find* (not invisible), and *not* over-resolved into a hard black blob? If off, dial `waterDeep`/`waterShallow` lighter/darker and/or `fishCueOpacity` — they move together.
- **Backdrop seam (#6, deferred):** does the treeline base still melt into the far water now that fog is ink, or does the fog/mist boundary show a line? If it shows, that's the `fog={false}` toggle decision.
- **Backdrop placement (#7, deferred):** `backdropY`/`backdropTilt` are now /dev-adjustable — confirm the treeline still fills the top strip across portrait/tall/wide.
- **Caustics under Focus:** confirm they visibly calm when Focus engages and no longer compete with cues in the foreground.
- Only a human, on a real iPhone, may create `v0.3.2-pond-polish-approved`.

**Slice — backdrop reframing (first gate look, same candidate):**
- First iPhone look passed the colour pass (deeper water reads, fish still findable) but flagged the far shore as "not seeing all the scene": the treeline was a thin band of mid-foliage with the crowns chopped off the top and the moon hidden down at the waterline.
- Diagnosed against the **real camera projection** (headless chromium at the 430×932 portrait aspect, screenshotting the live deploy — not a local build). The horizon is camera-fixed and high, so the backdrop is always a ~90px strip; the camera is load-bearing for the approved cast/fish/rod screen-projection and was left untouched.
- Lifted `backdropHeight` into `TUNING.visual`, then swept `backdropY`/`backdropHeight` via temporary `?by/?bh` query overrides from a single deploy. Winner: lower the plane (`backdropY` 0.8 → 0.2) so the strip frames sky + moon + full crowns instead of mid-foliage; the base drops to y=-1.2 (no waterline gap) and the sky still fills to the top edge (no void seam).
- Repacked the canopy texture to fill the reframed strip: moon raised `h*0.62 → h*0.42` into the framed slice + brighter halo, and a faint star scatter for depth.
- Temporary `?by/?bh/?bt` instrumentation removed; final values baked into `TUNING.visual`. Re-confirmed by headless render at defaults.
- Still the same candidate before the gate — re-check the **placement** item (treeline fills the top strip across portrait/tall/wide) and that the moon/sky now read as a far shore.

---

## v0.4-far-water-candidate (2026-06-01)
*A new chapter, not a polish pass. Canon was rewritten first (`19_THE_FAR_WATER.md` + new `00_OVERVIEW` paragraph): **distance is the spine of the game** — you cast blind into the dark far water and reel the unknown back into clarity. Builds on (and includes) the unreviewed pond-polish + backdrop-reframe work, so gating this also gates those visuals.*

**Shipped (all 10 of the requested changes):**
- **Dock removed entirely** — mesh, texture load/config, asset, all 7 constants, story line. You're on the bank now, rod in hand. The paragraph's "I crept along the dock" is retired in canon.
- **Cast reaches the far shore** (`castMaxRangeM` 8 → 9.5), **wider lane** (`castVisibleHalfWidthM` 1.9 → 3.2), and **in close to the bank** (`castMinForwardM` 0.6 → 0.25).
- **Accuracy falloff:** the lure scatters from the aim point by a radius that grows with reach (`castSpreadNearM` 0.06 → `castSpreadFarM` 1.2, curve 1.7). **Deterministic per gesture** (hashed from the release point) so the same drag always lands the same — testable, not a slot machine. `computeCast` now also returns `aimTarget` + `spreadRadius`. The aim preview ends at the true (scattered) landing, so it's WYSIWYG-legible.
- **Visibility falloff:** flipped the fish depth fade — which *brightened* far fish, backwards for the loop — to a distance model: clear near, murk far (`fishFarVisibility` 0.3, near 1.15, curve 1.6). Retired the deep/shallow multipliers.
- **Fish roam the whole expanse** (`fishableMinZ` -3.05 → -5.4, `fishableMaxZ` 1.2 → 1.8, wander radius 4.2 → 5.5).
- **Rod-in-hand:** butt pinned to the bottom-right corner (`rodScreenButtXRatio` 0.9 → 0.95, bottom 0.03 → 0.012), **doubled** (stroke 4 → 8, reel ×2 via one `rodReelScale`), pointing up toward the middle, and **swaying to track the aim** (`rodAimLeanFraction` 0.2). Visual only — cast origin stays `TUNING.world.rodTip`, and the line isn't drawn while aiming, so nothing disconnects.

**Verification (machine + sighted):**
- Vercel build green (typecheck/lint/build); no dangling dock/`fishDepthVisibility`/deep-shallow references.
- **Sighted via the headless harness** (chromium at 430×932 against the live deploy, with a scripted drag-aim-release): dock-free open water confirmed; far fish dimmed into murk; the rod renders doubled, corner-anchored, leaning toward the aim with the gold preview arc tracing the cast; cast fires and the line connects.

**Cut / deferred:**
- A widening aim-preview *ring* to telegraph spread before release — deferred. The preview already ends at the true scattered landing (WYSIWYG), so the falloff reads honestly; the ring is a polish to add if the gate wants a stronger tell.
- Fish count unchanged (still 1–3 visible) — the bigger area may read sparse; left for the gate to call.

**Next — the human iPhone gate (`far-water` checklist on `/dev`):**
- The eight canary judgments: distance feels real; far is murky; reach (far + close); accuracy reads as mechanic not bug; **the reveal** (lure a far fish into clarity); the rod (doubled / corner / points-middle / sways); dock-gone-and-coherent; loop preserved.
- Starting values (how far, how loose, how dark, rod angle/size/lean) are a co-tuned first guess — for the gate to refine.
- Only a human, on a real iPhone, may create `v0.4-far-water-approved`.

**Slice — gate refinements (same candidate):**
- **Accuracy was "too jittery."** Root cause: the aim preview *and* the rod were tracking the **scattered** landing point, whose per-gesture hash jumps every frame as you drag — so the predicted dot and the rod twitched. Fixed by tracking the **smooth intended** aim point instead; the scatter is realized only at release. Added a dashed **uncertainty ring** (`runtime.aimSpread` → `overlay.aimSpreadPx`, projected from one spread-radius in world to screen px) that grows with reach, so the looseness reads as a designed mechanic before you commit — this is the deferred telegraph, now built because the jitter is exactly what it solves.
- **Rising moon** "like time is really passing": pulled the moon out of the baked canopy texture into a separate `<Moon/>` sprite (`createMoonTexture`) that climbs slowly from near the crowns into the sky over a few minutes (`TUNING.visual.moon*`: start 0.45 → max 1.35 at 0.004 m/s, renderOrder in front of the treeline). Stars stay baked/fixed.
- **5 fish, always:** `fishMaxVisible` 3 → 5 and the decor pool is filled every spawn (`extraCount = fishMaxVisible - 1`), so the bigger water reads populated and spread out, not sparse.
- **Build discipline:** the first push of this slice ERRORed on Vercel — `useRef(TUNING.visual.moonStartY)` inferred the `as const` literal type `0.45`, rejecting a `number` reassignment. Caught by the §3.1 executor (Vercel build), fixed with `useRef<number>(...)`, re-verified green. The failed build never flipped the alias, so the live site was never broken.
- Re-confirmed by headless render: uncertainty ring visible and reach-scaled, preview/rod smooth (no jitter), ~5 fish spread across the water, moon present low near the treeline.

**Constitution:** `v0.0-ultracode-ratified` was **e-signed by the owner** (Adam Rappaport / Mentis123, by explicit chat consent, 2026-06-01) on the `18_ULTRACODE_PARADIGM` commit — the agent created the tag solely under that recorded consent.

**Slice — second gate look (same candidate):**
- *"Fish all start in the foreground"* — `spawnFishFromInstance` seeded every fish near `fishStart` (z≈1.35). Now spawns each at `nextWanderTarget` (anywhere near→far across the fishable water), so they begin spread across the expanse; far ones sit dim in the murk.
- *"Moon is in front of the distant trees, should be behind"* — the backdrop baked sky+trees into one plane with the moon sprite on top. Split into a back sky+stars layer (renderOrder -3) and a front transparent treeline layer (-1), moon between (-2). Foliage now occludes the moon; it rises out from behind the far shore. Verified headless: moon glows behind the treeline, fish fan across the water.

**Slice — landing-zone reticle as a perspective ellipse (same candidate):**
- *"The cast target needs tuning: a tight exact point when near, a large less-accurate zone when far — and it should be elliptical, lying on the pond surface, not a flat circle."* Two changes:
  - **Perspective ellipse.** The reticle was a screen-space circle (one `+X` spread-radius projected to px, used as both width and height). Now it projects the **four cardinal points** of the real landing disc on the water plane and reads the screen half-spans → `aimRingRx`/`aimRingRy`. A Z offset foreshortens far harder than an X offset under this camera, so `rx > ry` (ry/rx ~0.44 far → ~0.70 near) and the ring **flattens the farther you aim** — it reads as lying *on* the water, not floating over it. CSS `border-radius 999px → 50%` for a true ellipse. Center stays the direct aim projection, so the dotted aim-line endpoint is unchanged.
  - **Precision tuning.** Tighter near (`castSpreadNearM` 0.06 → 0.04, an exact point), wider far (`castSpreadFarM` 1.2 → 1.65, a clear gamble zone), curve 1.7 → 1.8. The lure scatter was already bound to this exact radius, so the ring is an **honest telegraph** of where the lure can actually land (sqrt-uniform disc, ring = true outer bound).
- **Ultracode verification — four independent adversarial lenses** over the diff (perspective math, telegraph truthfulness, regression, tuning feel). The math lens numerically reproduced the projection against the real camera: ry/rx monotonically flattens with distance, no Z sign error, the shared `projVec` reuse is safe (set→project→capture), no NaN/behind-camera case in range. Regression lens: no dangling `aimSpreadPx`, aim-line endpoint intact, ellipse CSS correct. Two lenses caught honest calibration gaps — **both fixed**:
  - The `ry` line-collapse floor lowered `0.2 → 0.1`. It never fires in the playable range anyway (true ry/rx ≥ 0.44), so this just makes the guard strictly more honest where it ever would.
  - `castSpreadFarM` lifted to 1.65 because the pond geometry caps real reach at reachT ~0.92–0.98 (the far shore is closer than `castMaxRangeM`). The felt far ring now lands ~1.45m (~45% of the visible cone — the intended wide gamble) instead of chasing an unreachable 1.5m ceiling.

**Slice — the Caught screen becomes a trophy + real fish art:**
- Early testers found the catch a letdown — landing a fought fish collapsed to one line of prose. Rebuilt the result screen as a **trophy**: a hero fish + `Landed / <Species> / <length> cm · <size word> / <fight>`, arriving with a rise + glow. New `<CatchResultCard>`/`<FishPortrait>`; the result state now carries the catch (species/size/fight) instead of discarding it; new `trophy.ts` derives a believable length and a procedural moonlit fish as the always-present fallback.
- **Real art wired in.** The owner generated 5 hero plates (Grok); processed each into a **feathered elliptical alpha** WebP (oval — hides the four corners and the corner watermark for free, 25–42 KB), `SPECIES_ART` → `/assets/fish/<species>.webp`. New `/dev/caught` gallery to preview all five.

## v0.5/v0.6 — The Catch arc (Journal + Share) (2026-06-05)
*Two chapters from `20_ROADMAP`, building straight on the trophy art. Pushed to main as slices (still gating the whole far-water candidate on the iPhone).*

**Chapter 6 — Journal (cross-session history):**
- New `catchJournal.ts` — append-only localStorage journal (`reelmobile.journal.v1`, canon schema in `15_TELEMETRY_AND_SESSION`), SSR-guarded, schema-validated, dedupe-by-id, capped at 500 (oldest roll off). Hooked into `sessionStore.recordCatch/startSession/recordCast`.
- New `/journal` route — every catch, newest first, each with its trophy `<FishPortrait>`, length, size, fight, and date; totals header; empty state. localStorage read in `useEffect` (no hydration mismatch). "View journal →" link added to the Caught card.

**Chapter 7 — Share (catch card):**
- New `catchCard.ts` — composites a 1080×1350 PNG (the trophy art + `LANDED`/species/length/fight + `REEL MOBILE` footer) on the same moonlit gradient as the in-game card. New `shareCatch.ts` — `navigator.share({files})` where supported (iOS/Android), else downloads the PNG; AbortError (user cancels the sheet) counts as success. Share button on the Caught card; new `/dev/share` preview of all five cards.

**Ultracode verification — four lenses (persistence/SSR, journal UI, share/canvas, regression/build):** three clean; the build lens ran the full pipeline (tsc + lint + `next build`) green across all 10 routes. One minor finding fixed: the journal grew unbounded — added the 500-cap so the per-write payload and the `/journal` render stay cheap.

**Checkpoint:** `v0.7-catch-arc-candidate` tagged at the user-approved state (trophy + art + journal + share + consistent nav) — a rollback anchor before the riskier Reveal/Gear work.

## v0.5 — The Reveal, v1 (2026-06-05)
*Chapter 5's other half (`21_THE_REVEAL`), finally built. Completes `19_THE_FAR_WATER` pillar 3: you can't tell how big a far shadow is until you reel it in.*

**Shipped (size concealment):**
- New `fishRevealAmount(position)` — smoothstep over `[revealNoneZ -3, revealFullZ 0.5]`. The fish mesh scale now lerps from a uniform generic size (`revealGenericWidthM 0.7 × revealGenericHeightM 0.26`) far out to the **true species size** near. So every far fish reads at one ambiguous size and resolves its real size on approach — a hooked fish **grows (or shrinks) into what it really is** as you fight it in, and the Caught screen names it. Composes with the existing distance dimming.
- Tunable in `TUNING.world`; the resolve distances/curve are an iPhone feel-gate.

**Deferred (need sighted tuning, flagged in `21_THE_REVEAL`):** shape concealment (generic far silhouette → species silhouette crossfade, not a pop) and cue genericisation. These are the parts that want your eye, so they're not shipped blind.

## The Reveal v2 + the alive pond (2026-06-05)
*The deferred halves of `21_THE_REVEAL`, now built, plus the companion the attraction fix unlocked. One candidate, gating before Ch8 Gear.*

**The Reveal v2 — shape + cue concealment (the full resolve gradient):**
- **Shape crossfade (pop-free).** Each fish now has a generic "smudge" twin mesh (`fishGenericRefs` + `createGenericSilhouette()`, a soft radial ellipse). Species-silhouette opacity ×`reveal`, twin opacity ×`(1 − reveal)` on the same `fishRevealAmount` gradient as the size lerp — far shows only the smudge, near only the true silhouette, between a brief crossfade. Twin uses **neutral** opacity (no `species.opacityMultiplier`) so brightness can't leak the species. No texture swap → no pop. Far fish stay spottable (the smudge ≈ the old far-shadow brightness).
- **Cue genericisation.** `cueForReveal()` returns an identity-free `GENERIC_CUE_KINDS` cue (wake/ripple) at a neutral `genericCueRadiusM` below `cueSpeciesRevealThreshold`; only near does the species' own cue + radius show. A far cue now reads as *something moved*, not *what*.
- So all three tells — size, shape, identity — hide in the dark and resolve together as a hooked fish is reeled into the clear water.

**Alive pond (companion to the nearest-fish-catchable fix):** every decor fish now emits its own cues (`decorCueMinMs`..`decorCueMaxMs`), far ones generic via the same `cueForReveal`. The expanse reads populated and each shadow is a real fish you could cast at — none betraying identity at distance.

**New constants** (`TUNING.fish`): `cueSpeciesRevealThreshold`, `genericCueRadiusM`, `decorCueMinMs`, `decorCueMaxMs`. Canon updated (`21_THE_REVEAL` v2 + alive-pond sections). Feel gates left for the iPhone: the crossfade band/curve and pond cue density.

## v0.8 — Gear (Chapter 8) (2026-06-06)
*Two rods + three lures as pre-cast sidegrades that deepen the distance gamble, never an upgrade ladder. Canon written first (`22_THE_GEAR`); approach de-risked by an ultracode panel (integration scout + canon adversary + independent designer) before any code.*

**Design (synthesized from the panel):**
- **Rods — baseline + specialist.** The **long rod** (default) reaches the far dark and is today's exact feel (all multipliers 1.0) — keeping it default protects the per-cast gamble (the canon adversary's call: a two-specialist scheme would trap players into a rod that can't reach the dark). The **short rod** can't reach the dark, lands near-exact, and fights on a tight margin (snaps easier) — a deliberate renunciation of the gamble. Took the independent designer's framing: precision and forgiveness are SPLIT across the rods (short = precise but fragile), so neither is strictly better.
- **Lures — each tied to how it converts cast inaccuracy into outcome** (not an orthogonal depth axis). **Natural** (default). **Popper**: big attraction (rescues a loose far cast) paid for with a big fear radius (spooks easily). **Sinker**: small fear (won't spook worked-close) paid for with small attraction (demands an accurate cast). Fear-as-lure-property is sanctioned explicitly in `22_THE_GEAR` (the fear mechanic pre-exists; the amendment blesses lures leaning on it — not smuggled).

**Build, against the scout's seam map:**
- New `TUNING.gear` (rod/lure multiplier tables, every default field 1.0), `src/game/gear/gear.ts` (ids/labels/resolvers), `src/game/persistence/gearStore.ts` (localStorage `reelmobile.gear.v1`, SSR-guarded).
- Rod range+accuracy in `computeCast`: `effMaxRange = castMaxRangeM * rangeMult` (projection only); `reachT` deliberately stays on the GLOBAL max so spread reads as f(physical reach) and `accuracyMult` tightens uniformly — the short rod is precise because it's confined to the tight near band, not because reachT was rescaled (which would perversely scatter it more per metre). Reticle stays honest automatically (single shared `spreadRadius`).
- Tension: `lineStrengthMult` scales BOTH the snap logic (`updateFight`) and the render-side warning (`effNearSnapThreshold` drives line colour/width + the danger bar) — the scout's flagged trap (a logic-only change makes the red warning lie).
- Lure sink/twitch (local reads only, not the rod-control deadband), and fish attraction/fear crossing into `fishStateMachine` via new `FishUpdateInput` fields applied to the **primary fish only** (decor pass 1.0, so ambient fish keep ignoring the lure).
- `ResultCatch.lure` now carries the equipped lure id (was hardcoded `'default'`) — a flat journal attribute, never a coverage grid.
- Minimal pre-cast `<GearSelect>`: a bottom-left glyph strip (rod glyphs drawn as the cast-curve profile; abstract lure marks), idle-only, persisted. No skeuomorphic chrome, no modal, no labels.

**Guardrails banked in `22_THE_GEAR`:** never a 3rd rod/4th lure, no tiers/XP/currency/unlocks, tension tolerance stays a fixed rod property (NOT adjustable reel-drag, `14_DO_NOT_BUILD` L99), lure/rod stays a flat journal attribute (no completion grid). Default gear = byte-for-byte today's feel, so the iPhone gate judges only the deltas. Feel gates: short-rod range cap + accuracy/snap deltas, loud-lure draw-vs-spook, quiet-lure draw floor.

## eval-and-premium-pass (2026-06-12, agent session — inside the v0.4 gate)

**Shipped:**
- Full codebase evaluation (`docs/CODEBASE_EVALUATION_AND_RECOMMENDATIONS.md`), then its P0–P2 items: simulation unified on `performance.now()`; dt-normalized damping in the verlet line and fish movement (60Hz ≡ 120Hz feel — was frame-rate dependent on ProMotion); frame-dt clamp; in-place (allocation-free) verlet; store updates throttled out of the 60Hz path; audio suspend/resume/dispose lifecycle; security headers; error boundaries; reduced-motion coverage; 48-test unit suite + GitHub Actions CI (lint/typecheck/unit/build/webkit e2e).
- `GameClient.tsx` decomposed 3,294 → ~1,100 lines across 11 modules (`GameScene`, `runtime.ts`, scene/*, `GearSelect`, `DebugHud`, `RodReel`, shared types). Mechanical moves only.
- Premium pass: surge camera shake + harder snap jolt; red danger vignette scaled to the equipped rod's effective snap threshold; tension bar glows by band (gold sweet spot / red danger); personal-best recognition ("Your first catch" / "Your biggest yet" / per-species) on the result card AND the share card, judged against the player's own journal only; rising G4→B4→D5 catch chime; first-session coaching (two diegetic hints, once ever); sound/haptics prefs strip (wordless glyphs, top-right) with a central haptics gate that collapses patterns under reduced motion; journal hero card; result-card staged reveal; pond fade-up on begin; iOS add-to-home-screen hint (earned after a catch, never a popup); gear lure names finally wired into result/story copy.

**Cut:**
- Procedural night-insect ambience layer — audio is gate-approved territory; not adding layers nobody has heard on a device.
- Full fixed-timestep simulation loop — dt clamp + damping normalization cover the correctness essentials; the ~10cm constraint-rate residual is pinned by a regression test (`verlet-line.test.ts`) with the tolerance to tighten when the accumulator lands.

**Discovered:**
- The splash screens double-advanced per tap on Chromium (pointerup + synthesized click both fired the handler) — one tap skipped the credits screen. WebKit masked it. Fixed: onClick is the sole trigger.
- The credits screens nested links and OfflineStatus's button inside a `<button>` — invalid HTML, hydration warning. Now a tappable div with the pill as the real button.
- Both e2e specs had been failing on main for weeks (stale v0.3.1 assertions; pre-hydration tap flake) — nothing was running them. They now pin to buildInfo/checklists and pass.

**Next:**
- The human iPhone gate on the whole stack (v0.4-far-water + all of the above): tap-cadence reel feel, surge-shake amplitude, vignette onset, chime, coaching copy — all in TUNING, all awaiting thumbs.
- Lighthouse run on a production deploy; record against 07_PERFORMANCE_BUDGET.

## fix-mobile-splash-cycling (2026-07-07)
*Follow-up to #24. The landing page kept flashing splash → credits ("Vibe Academy") → start → splash on mobile, and the game never actually started.*

**Discovered:**
- #24 moved the `/ → /game` forward from a client `SplashGate` to a React `redirect('/game')` inside `app/page.tsx`. But `/` is statically prerendered, and `redirect()` in a static route can't emit an HTTP redirect: the served document was a **307 with no `Location` header** and a hydrating `__next_error__` shell whose only redirect instruction lived in the client RSC payload (`NEXT_REDIRECT;replace;/game`). So the redirect only completed *after* React booted on the device.
- On mobile — standalone PWA launched at `/`, service worker in play — the browser treats that 307-without-Location document as an incomplete navigation and re-enters `/`, which remounts `GameClient` and bounces it back to the splash. That is the cycle the player saw: splash → credits → start → (re-enter `/`) → splash, never settling.

**Shipped:**
- Replaced the boomerang with a real server-level redirect: `redirects()` in `next.config.mjs` maps `/ → /game` (307, `permanent: false`) before any React renders — verified `/` now returns `307` + `location: /game` with an empty body in both `next dev` and `next start`. Deleted the now-dead `src/app/page.tsx`.
- Repro'd the fixed cold-start in a mobile Chromium harness: entering via `/` follows a single HTTP redirect to `/game`, reaches `scouting`, and stays put (no remount, no cycle). typecheck + lint + 48 unit tests green.

## pipeline-fixes (2026-10-24)
*Four defects found while comparing Reel against Birb's mobile discipline for the rebuild memo (`docs/rebuild/01_THE_POND_WE_REMEMBER.md`). Each verified in source before touching it.*

- **Boot DPR was stuck at 1.** `GameClient.tsx` fed `useState(1)` to `<Canvas dpr>` while `runtime.ts` believed `min(devicePixelRatio, cap)`; nothing set the React state until a degrade, which then moved 2 → 1.5 and *raised* resolution on a struggling phone. Now initialised from the device ratio.
- **Quality recovery could never fire.** The sampler capped measured fps at `fpsRecovery` (55) and recovery required `> 55`. New `TUNING.performance.fpsSampleCap` (120) with an invariant test that it sits above `fpsRecovery`.
- **dt clamp halved** `maxFrameDtSeconds` 0.1 → 0.05: bite windows and snap are dt-sensitive.
- **iPhone had no haptics** (`haptics.ts` bailed without `navigator.vibrate`). Fallback: a hidden `<input type="checkbox" switch>` clicked programmatically, which fires the native tick on iOS 18+. Unverified on glass whether it fires outside a tap.
- **Silent-switch iPhones heard nothing**: `navigator.audioSession.type = 'playback'` set when the context is created.

Left alone: `preserveDrawingBuffer: true` (two e2e specs read `toDataURL`; costs bandwidth on iOS tile GPUs, revisit with a screenshot path that doesn't need it) and the per-frame `filter/map` allocation in the fps sampler.

Gates: typecheck, lint, 48 unit tests, production build. **Not yet gated on the iPhone.**

## alpha-canon (2026-10-24)
Owner approved the six rebuild decisions from `docs/rebuild/02_THE_WATERS.md`. `docs/goalpack/23_ALPHA_CANON.md` is now the authoritative canon for ALPHA and wins over earlier goalpack files where they conflict (amends `14`, `22`, `08`, `13` as listed in its §8 and §10). `00_OVERVIEW` and `AGENTS.md` point to it. Name research in `docs/rebuild/03_THE_NAME.md`: "The Waters" is usable with a wordmark and coined handle; the owner decides. Nothing built yet; A1 (light and water) is the next chapter.

## A1 — light and water (2026-10-24) · `v1.0-light-candidate`
*Chapter A1 of `23_ALPHA_CANON` §10. The repo is now `Mentis123/playthewaters` (Reel Mobile's 116 commits merged in, no force-push), deployed at playthewaters.vercel.app. The name is The Waters.*

**Target committed first:** `docs/alpha/A1_RUBRIC.md` (blind gate: the new water must win both rounds; 26-item binary rubric, pass 22, starred items required) went in before any A1 code.

**Shipped:**
- **The drifting light** (`src/game/light/pondLight.ts`, pure; palettes in `TUNING.light`): dawn / day / dusk / night on one cycle, ~10 min per light, plateau-held so each light dominates and the blend never jumps (tested: max per-step colour change < 0.01 across the wrap). First visit opens just before the dusk turn; a return visit jumps 0.2–0.55 of the cycle so it starts on a different light (tested for every light and jump). Phase persisted (`thewaters.light.v1`) on pagehide/hidden and every 15 s. `?light=` pins it for review and captures.
- **The water** (`AlphaWater`): analytic three-cosine wave normals (the kit's `waveGradient` idea from `adamrappaport/public/map-assets/water.js`) plus the existing normal map for detail; Schlick fresnel mapped to a usable weight from bank height; a sky-gradient reflection that turns to treeline toward the far shore (so far water is dark for a true reason, as in photos 01/02); a sun/moon glint with a sharp core and a broad sheen; clear-near → deep → dark-far body colour; caustics only in the clear near band; **fish drawn into the water** (per-fish darkening + surface bulge from the same visibility the sprite uses, so the in-water shadow hides in the dark exactly as the sprite does). Sprites still carry the reveal (`21`).
- **Neutral tone mapping**, exposure from the light; live sky gradient with sun glow and night stars (`AlphaSky`); treeline, bank and moon tinted/faded by the light.
- **`?look=classic`** renders the v0.4 scene verbatim (old water, sky, lights, ACES) as the gate baseline.
- **`/ab`**, the blind gate: two rounds (night, dusk), random hidden order, opaque per-session tokens (`?pond=`) so the URL never names the look, reveal only after both picks, verdict against the pre-committed threshold.
- **Effective state read back** (`window.__waters`: look, light, phase, tone mapping, DPR, drawing buffer, calls, triangles) and `tests/e2e/a1-effective.spec.ts` asserting it on the iPhone 13 profile at all four lights, in CI.
- **Rename to The Waters**: metadata, manifest, share text, catch-card URL, wordmark, `/dev`. The neon REEL MOBILE splash is retired for a code-built dusk title card until commissioned art lands.
- **Art prompts for agents**: `public/art/PROMPTS.md` + `prompts.json` (served at `/art/…`, pointed to by `/llms.txt`): splash, icon set (iOS ignores the current SVG icons), OG image, six water cards from the reference photos, and the A2 treeline layer.

**Planted defects (every new oracle watched failing):** reverting the boot-DPR fix turned all four effective-state checks red with `dpr 1 != 2`; shrinking `returnJumpMin` to 0.02 failed "a return visit starts at a different light". Both restored, both green.

**Measured (SwiftShader, 390×844 @2x):** 25–26 draw calls, ~710 triangles, DPR 2, buffer 780×1688, tone mapping Neutral, zero page errors at all four lights and classic. **No phone number exists yet.**

**Tuned by capture, three rounds:** first pass had 5 m swells (read as smeared bands) and day glare blowing out the near water; wave scale 1.25 → 3.1, slope 0.09 → 0.055, day glint 0.55 → 0.2, night exposure 1.1 → 0.95 and darker night water to keep the v0.4 moonlit mood.

**Not done / known:** the bank strip is still the v0.4 texture (A2). Under SwiftShader the drift advances slower than real time because each frame's step is clamped to `maxFrameDtSeconds`; on a 60 fps phone it runs at the designed rate. `preserveDrawingBuffer` still true (e2e reads pixels).

**Gate:** the owner's iPhone, `/ab` then the rubric, recorded in `docs/alpha/A1_RUBRIC.md` §4. Candidate only; `-approved` is the owner's tag.

## A2 — the bank (2026-10-24) · `v1.1-bank-candidate`
*Chapter A2 of `23_ALPHA_CANON` §10. Rubric committed before the build (`docs/alpha/A2_RUBRIC.md`). A1's result recorded honestly in its rubric: owner-accepted by play; the `/ab` picks live only on the owner's phone and were not reported.*

**Owner reports fixed first:** there was no way to leave the pond. A leave glyph (top right, idle-only beside sound and haptics) returns to the title through the same reset a new seed does (`resetToTitle`), suspends audio, exits fullscreen, records `session_end`. e2e-tested, and watched failing with the glyph made a no-op.

**Shipped (`src/components/game/scene/AlphaBank.tsx`, one draw call each, built once, animated in the shader from one clock, no per-frame allocation):**
- **Stones** along the water's edge (photo 01): 17 lumpy rounded boulders from one smoothed, displaced icosahedron, instance-coloured greys, lichen flecks and moss on top in the shader, wet and darker where they meet the water. Seated just back from the edge so they hide as little castable water as possible.
- **Bank ground**: a new painted grass-and-clover texture with a few white flowers and a damp edge, tinted per light by a new `ground` field (the first pass stayed lawn-green at night).
- **Weeds**: 150 tufts of single-triangle blades on the bank, swaying by instance position (never in lockstep), height-weighted so roots stay planted.
- **Side reeds**: blades with shader sway replace A1's CPU-rewritten cones (which allocated every frame). Far-margin reeds removed: they stood up into the treeline as stray lines.
- **Layered far trees**: back row hazier (pulled toward the fog), front row darker with red-barked pines with flat cloud crowns (photo 01), both tinted per light.
- **Wet shore** in the water shader: water darkens and reflects less over the last 0.45 m before the stones (`uShore`, A2 only).
- **Far mist** (light `mist`: dawn 0.85, day 0, dusk 0.25, night 0.45) as patchy instanced banks; **midges** (light `midges`) as one additive points draw with clamped size.
- **Look ladder**: `?look=a1` renders A1 exactly (the A2 gate baseline), `?look=classic` v0.4; the read-back reports which. `/ab` now gates A2 vs A1 at day and dusk on the same URL (standing rule in `AGENTS.md`).

**Tuned by capture, three rounds:** first stones read as a solid wall with polka-dot lichen (smaller, gaps, finer lichen); ground ignored the light (new `ground` tint); dawn mist invisible over dawn water. Mist was then **measured**, not eyeballed: far-band luma A2 vs A1 = dawn +20, day 0, dusk +6, night +6, so it works and is light-correct, but it still reads as a haze rather than distinct banks. The weakest element; rubric items 12–13 will judge it.

**Deferred, stated in the rubric before the build:** the wake pool (instanced ripple rings) moves to A3 with the cue/habits work.

**Measured (SwiftShader, 390×844 @2x):** 28–31 draws, ~4.4k triangles (budget 100 / 80k), zero page errors at all four lights. e2e: 8/8 (a1-effective ×5, a2-bank ×3). **No phone number yet.**

## A3 — habits (2026-10-24) · `v1.2-habits-candidate`
*Chapter A3 of `23_ALPHA_CANON` §4 and §10. A2 passed its blind gate (owner: "A2 won both rounds"), recorded in `docs/alpha/A2_RUBRIC.md`. A3's rubric committed before any A3 code.*

**Shipped (`src/game/fish/habits.ts`, pure; data in `TUNING.habits`):**
- **Homes.** Five features on the home pond (the stones, reeds left and right, the deep, the open water); each species takes homes from its own preference list (carp at the stones, pike in the reeds, kingfish in the deep, bass split, minnows in the open). Assigned from a separate seeded stream (`runtime.homeRng`) so a baseline pond spawns exactly as before.
- **Feeding lights.** Each species feeds at one or two of the four lights (carp day, bass dawn, pike dusk, minnows dusk and night, kingfish night), smooth over a window. Off-feed: stays within its home, slower (0.7×), less curious (notice 0.7×). Feeding: roams 2.2× wider, 1.8 m nearer the bank, 1.25× faster, notice 1.3×, and its cues come twice as often. So at night the kingfish comes up from the deep toward the near water.
- **The spook rule.** A splash within 0.55 m (× species fear × lure fear, eased 35% while feeding) of a wandering or curious fish sends it to the far dark for 18–34 s (shyer fish longer), visibly (a wake at the spot), and it ignores lures until the hold runs out. A splash outside that and inside notice range still draws it in. Implemented as a `holdMs` on the existing `flee` state, so no new state kind leaks into the UI.
- **The still lure.** The kingfish (5.2 s) and the carp off-feed (2.6 s) only commit after the lure has been dead still that long, and give up after 9 s more. Stillness is measured since the lure landed or last moved; rod control resets it. A faint ring closes around the lure as stillness builds and resets the instant it moves.
- **Baselines stay exact:** everything is gated on an optional `habit` input; without it (and `?look=a2`) a fish's trajectory is byte-identical to before (unit test). `?look=a2` renders A2 with habits off; the read-back reports `look` and `habits`.
- **`/ab` now says what is being reviewed** (owner: "make sure the ab is updated with what it is I'm reviewing"): a brief and a "try this in both ponds" list at the top, configured per chapter in `GATE` (rule added to `AGENTS.md`). A3 gate: day then night, A3 vs A2.
- **Debug hook** (`?debug=1` only): `window.__watersDebug.castAt(x, z)` starts a real cast; `.fish()` reads fish, homes and the still clock back.

**Checks:** 67 unit tests (9 new for habits), 10 phone-profile e2e. Planted defects: removing the still gate failed the still-lure test; ignoring the spook hold failed the hold test. Real-game probe (headless, same seed): a cast on top of a moss bass → `flee` in A3, `notice` in the A2 baseline. Budget unchanged: 32 draws, ~4.9k triangles.

**Moved to the backlog, stated in the rubric before the build:** the wake pool (deferred from A2). Measure first: 28–37 draws against 100.

**Not testable here:** the canon's real gate for A3 is people. Five strangers, untold, 10 minutes each; at least one habit named by three of them.

## playtest page + a /dev bug (2026-10-24)
*The canon's A3 gate is five strangers, untold. The owner asked for a page to DM them.*

- **`/playtest`** (unlisted, noindex): play first, then the open question **alone** ("What did you notice about how the fish behave?"), and only after that a checklist (same places / busier at times / shot off when landed on / took a still lure / saw the ring), minutes played, fun 1–5, would-you-return, broken/confusing, anything else. Honeypot field; says plainly what is sent (answers, optional name, game version, device type and screen size; no email, no tracking).
- **Storage**: this site has no database, so answers POST to `adamrappaport.vercel.app/api/waters-feedback` (Neon, table `waters_feedback`, created on first write). Origin-locked to this site and its previews, size-capped, no IP stored. **Reading** needs the owner's key; only its SHA-256 is in the (public) adamrappaport repo, because this session cannot create Vercel production env vars (403). `WATERS_FEEDBACK_CLOSED=1` on that project closes it.
- **`/playtest/results`**: the owner's view. Key remembered per device. Shows the gate (a habit named by 3 of 5 in the OPEN answers, keyword hints, owner confirms from the quotes), the checklist tallies, average fun, and every answer. Rows from tester `__selftest__` (the deploy check) are hidden.
- **Verified end to end**: bad origin 403, empty answer 400, no or wrong key 404; a real browser submit from this site's build landed in Neon and read back with the key; the results page hid it.

**Bug found and fixed:** `next.config.mjs` hard-coded the candidate tag (`v0.4-far-water-candidate`) and overrode `src/lib/buildInfo.ts`, so **`/dev` showed the far-water checklist through A1, A2 and A3**, despite the DEVLOG entries saying the A1/A2/A3 checklists were live. The config is now the one source (`v1.2-habits-candidate` → `a3-habits`, with v1.0/v1.1 mapped), and `AGENTS.md` says to bump it there. `shell.spec` (which asserts `/dev` shows the current milestone's checklist) passes.

## v1.2.1-habits-visible (2026-10-24)
*Owner, after the A3 gate: "the pond one and two seemed the same for me… I couldn't really see any difference when I casted and how the fish reacted."*

**Why the two ponds read the same (diagnosis, before any change):** the habits were running (the headless probe showed `flee` in A3 against `notice` in A2 on the same cast), but nothing on screen said so.
- A spooked fish fled at its normal approach speed. From the bank, a fish leaving looks just like a fish wandering.
- The flee left one wake 0.21 m across, under the splash's own rings.
- Homes and feeding lights change things over minutes, and an A/B round lasts about one minute.
- The still-lure ring peaked at a faint 0.3 opacity.

So A3 was correct and impossible to tell apart from A2. A habit nobody can see fails the canon's gate the same way a missing habit does.

**Shipped (A3 only; A2 and the baselines are unchanged and still byte-identical):**
- **The bolt.** A spooked fish goes 3.2× faster for the first 1.2 s and leaves a V-wake trail every 160 ms. Its splash sound and a haptic tick fire the moment it spooks.
- **The scatter.** The splash flushes every spookable fish within 1.6 m, not just the nearest. The ones further out hold off for less time (×0.45).
- **Cue contrast.** A feeding fish shows a cue every 0.3× its usual interval and an off-feed fish every 1.7×, about 5.7× apart (was 2×). Speeds are 0.55× off-feed and 1.45× feeding.
- **The spook radius** is 0.75 m (was 0.55).
- **The wait.** A fish waiting for a still lure sends a small nudge ripple every 1.3 s while the lure is still moving. The still ring now peaks at 0.62 opacity.
- **X-ray** (`/game?pond=…&xray=1`, owner lens): each fish gets a coloured dot (grey idle, gold feeding, green after the lure, blue waiting for a still lure, red spooked) and each home gets a ring, with a legend. Habits are visible on demand so the owner can check the rule fired before judging the feel.
  - First build: the dots were drawn (+10 calls) but invisible. An opaque mesh draws in the opaque pass, then the transparent water paints over it, whatever its `renderOrder` or `depthTest` say. The fix was making them transparent so they sort after the water.
- **`/ab` gate A3.1**: rounds day then night, A3.1 against A2. The brief says what changed, and each pond in the result panel has an X-ray link.

**Checks:** 73 unit tests (bolt, scatter and cue-ratio added). Phone-profile e2e: a1-effective, a2-bank and shell all pass. Headless: the same cast gives `flee` + 1 spooked in A3 and `approach` + 0 spooked in A2. X-ray on is 42 draws / 5.2k triangles; off is 32 / 4.4k.

**Not testable here:** whether it reads on the phone. That is the `/ab` rerun, then the five strangers.

## v1.3-wall (2026-10-24)
*A3.1 passed the owner's blind gate ("Behavior is clear - passed"). A4 per canon §10: the wall and the link. Rubric committed first: `docs/alpha/A4_RUBRIC.md`.*

**Shipped:**
- **Keep or let go, one keeper per visit.** Every catch card asks Keep or Let go, and both go straight back to fishing.
  - A second Keep in the same visit swaps: the card warns first ("Keeping this one puts it back"), and the pond says "On the wall. Your Bronze Carp went back in."
  - Letting go leaves a ring where the fish went back in.
  - A visit is one session. Pure logic is in `src/game/wall/wall.ts`; storage key `thewaters.wall.v1`.
- **The wall.** A record board with one line per species: the heaviest one kept, its weight in lb and oz (`W = a·L^b`, per-species coefficients in `TUNING.wall`), water, light and lure, heaviest first.
  - It opens from a board glyph beside the leave glyph, from "The wall →" on the catch card, and at `/wall`. "Every catch →" leads to the journal underneath.
  - A released-legend line in a second colour is in the data model and the CSS; nothing draws it until legends exist (A5+).
- **The catch link.** Share sends the card image plus `/c/<code>` (in the share text as well as the url field; without a share sheet the link is copied).
  - The code is base64url JSON: seed, spawn, phase, species, size, hook point, lure, kept. Versioned, every field validated, capped at 400 characters. ~140 characters in practice.
  - The visitor skips both title screens and lands on the sender's pond (the same primary fish in the same place), at the sender's light (still drifting), with the fish's silhouette breathing where it was hooked.
  - The arrival card says what and where, never how (no lure). "Fish here" starts, and the silhouette fades over 9 s.
  - A code that does not decode lands on the normal title screen.
- **DM preview.** `/c/<code>/opengraph-image` (edge) draws the fish art, name, length, weight and light, never the lure; `metadataBase` is set so the image URL is absolute.
- **`/ab` is in review mode** for A4. Features cannot be judged by a blind pair, so the page has the brief, seven steps, a sample link to today's pond, and the seven starred rubric checks as yes/no (AGENTS.md /ab rule updated: `MODE` in `src/app/ab/page.tsx`).
- **Read-back:** `window.__waters.firstFrameMs`, ms from navigation start to the pond's first rendered frame.
- `/dev` shows the A4 checklist (`v1.3-wall-candidate` → `a4-wall`).

**Bug found on the way:** the game hides its canvas until the title screens are passed (`.game-canvas` at opacity 0), so the first arrival build drew the pond (13 draws) behind a flat teal screen. The canvas now shows at once for a link visitor. Found by a screenshot, not by a number: the probe said 13 draws while the picture said nothing.

**Checks:** 82 unit tests (9 new: link round trip; 19 bad, truncated or hostile codes rejected without throwing; arrival line never names the lure; the keeper swap; let go; heaviest per species; weight; corrupt storage). Phone-profile e2e: 15 pass, including the new `a4-wall.spec` (cold link: sender's light ±0.02 and the same primary fish to 1e-6; broken link → title; keep, swap, let go, wall overlay, `/wall`).

Planted defects, each caught:
- No swap → the unit test fails.
- No spawn bound → the hostile-code test fails.
- The link's seed ignored → the e2e "same pond" test fails.

Headless cold open (SwiftShader, no network throttle): first frame at 503–883 ms.

**Not testable here:** the < 2 s gate on a real phone over a real network; the iMessage / WhatsApp preview rendering; the share sheet on iOS.

## Art delivery (2026-10-24)

Delivered all ten prompts using built-in imagegen, in owner priority order, plus four PNG icon derivatives. Six water cards use the owner reference photographs. Exact delivery paths and dimensions follow public/art/prompts.json; WebP and JPEG exports use quality 85. Treeline retains generated alpha; icons are opaque. All prompt statuses record deliveredBy and date.

Validation: decoded all 14 output files, checked formats and exact dimensions, confirmed transparent treeline pixels and opaque icon exports, and visually inspected generated compositions. This is an asset delivery, not a chapter candidate: no game code, A/B gate, candidate tag or approval changed. In-game tinting, treeline repeat seam, real-iPhone icon appearance and chapter comparisons remain for the game agent and owner. Full gameplay milestone validation is not claimed.

## v1.3.1-wall (2026-10-24), owner's first phone pass on A4
*"No spot seen?" and "when I go to keep a second it doesn't ask about letting the other go and give me a confirmation."*

- **The spot is marked.** A gold ring keeps opening on the water around the silhouette (`TUNING.link.markerRadiusM`, `markerOpacity`). The silhouette is darker (0.55 → 0.7). The card says "The gold ring on the water marks where it bit." Before this, the silhouette was the only marker, and it looked like any other fish shadow.
- **Keep is confirmed on the card.** It shows "On the wall ✓" (plus "Your Bronze Carp went back in the water" after a swap), then Keep fishing or See the wall. Before, it jumped straight back to fishing with a three-second note at the top of the pond.
- **A second Keep asks first:** "You can keep one fish per visit. You're already keeping a Bronze Carp (30 lb 3 oz). Keep this Reed Pike instead, and let the Bronze Carp go?" → [Keep the Reed Pike] / [Keep my Bronze Carp, let this go]. The small grey warning line is gone.
- **A visit survives a reload or a new tab.** It ends when you leave the pond (leave glyph) or after 30 minutes away (`resolveVisit`, `thewaters.visit.v1`). Before, each page load was a new visit, so opening the game again skipped the question.
- The `/ab` e2e test waited on the review page's sample link before reading it (a race, not a product bug).

Checks: 83 unit tests (visit: survives a reload, expires, rejects a clock that ran backwards). 15/15 phone-profile e2e, including keep → confirmed → reload → second keep asks → swap confirmed.

## art wired in (2026-10-24)
*The art agent delivered all ten prompts (PR #1). Four are wired in now; the six water cards wait for their chapters.*

- **Icon:** the manifest and `apple-touch-icon` now point at the painted PNGs (192, 512, maskable 512, 180). iOS ignores SVG home-screen icons, so the game used to install with a blank icon.
- **Title screen:** the painted splash is the title background, with the dusk gradient underneath while it loads. The title and tagline sit in the painted sky above the treeline (checked at iPhone 13 and SE sizes).
- **Link preview:** `public/og-title.jpg` is the painted shoreline with "The Waters" set over its dark left side.
  - It is rendered once with next/og and saved as a 154 KB JPEG. The live route made a 1.1 MB PNG, which some chat apps drop.
  - Catch links keep their own fish preview.
- **Far treeline:** the painting (as `treeline-01.webp`, 420 KB; the 2.3 MB PNG master is kept and left out of the service-worker precache) replaces both drawn rows.
  - The swap happens only once the image has decoded, so the first frame never waits on it. `?treeline=code` is the old one; `/ab` links both at dusk.
  - **First wiring went into the wrong component:** A2 and later draw `LayeredTreeline` (AlphaBank.tsx), and `AlphaTreeline` is the A1 baseline's. The art-vs-code captures were identical, which is how it showed. The A1 baseline is untouched.
  - **Tuning, by capture at all four lights:**
    - At 62% of the strip height, the lower half of the painting sat under the water line and the trees read tiny.
    - At 100% they read near.
    - 82% is it.
    - The light's multiplier is applied twice to the painting: it is evenly lit and much brighter than the drawn rows, so with a single multiplier it glowed at night. Now it reads as painted by day and as silhouettes at dusk and night.

Checks: 83 unit, 15 phone-profile e2e, no page errors.

## v1.4-lilypond (2026-10-24)
*A4 passed ("A4 passed"). A5 per canon §2/§4/§5/§10: water 2 and the walk. Rubric committed first (`docs/alpha/A5_RUBRIC.md`; it holds the legend's conditions and is never served).*

**Shipped:**
- **A water is data.**
  - `src/game/waters/waters.ts` holds, per water: species weights, homes, pad islands, reed islands, body colours, clarity, reflection and the legend's lights.
  - Spawning, homes and the water shader read it. The home pond's rng streams and shader output are unchanged; old seeds and links regrow the same fish.
  - Clarity is now a uniform. Another water's colours are the light's home colours scaled by (its colour / home day colour), so all four lights still move it.
- **The walk.**
  - At the home pond's left edge, a worn path of stepping stones leads off with a breathing warm light through the trees; the lily pond has one at its right edge.
  - Tapping it runs a 3.6 s camera walk: out along the bank toward the path, a soft veil, the next water grown, in from the other side. No menu.
  - The water you are at is remembered (`thewaters.shore.v1`). Arriving counts a visit (the legend contract counts visits, never the clock).
  - The first arrival shows `02-lily-pond.webp` with "the lily pond", once.
- **The lily pond.**
  - Brown, half the home pond's clarity, 45% of its sky reflection, no bank stones (photo 04 is grass and reeds).
  - Five drifting pad islands (79 pads, one instanced draw, re-matrixed per frame without allocation) and two reed islands.
  - Fish under a pad vanish: sprite, smudge and in-water shadow, eased.
  - A cast onto a pad snags. The lure sits on the pad and fish ignore it; any tap frees it with a splash that spooks nearby fish, and nothing is lost.
  - Fish: bass, pike, minnows and carp, no kingfish.
- **The old sinking lure** (home pond find).
  - A brass glint under the near bank, for a moment every 4.2 s. Cast onto it: "Not a fish. An old sinking lure, tangled in line under the bank."
  - Once found, it rests on a bank stone. Tap to tie it on, tap again or pick any strip lure to take it off. Never in the strip; while tied, no strip lure shows as chosen.
  - It sinks deeper than any other lure.
  - The home pond grows a "NO SINKING LURES" sign.
  - On the wall it is marked by its lure and never displaces a line made without it.
- **The bench** (lily pond): tap it for a weathered plank with one carved line, the only written rumour.
- **The legend, Old Mossback.**
  - Present on odd lily visits from the third, at dawn and dusk.
  - Surfaces every 2–4 min with a thump, a splash, a wide ring and a dark back.
  - Takes only the old sinking lure, still for 12 s, within 1.6 m. While that lure lies in its water, other fish keep away.
  - A cast landing within 0.7 m sends it off with a bow wave for the rest of the visit.
  - Always its full size (89 lb 15 oz, the heaviest fish in its water).
  - Its link and preview say "something very big" with no name, art or silhouette, only the ring where it was hooked.
  - Released, its wall line is drawn in the second colour.
- **Links and the wall carry the water.** An optional `w` field; A4 links still open the home pond.
- **`/ab`** is in review mode for A5: steps, the home and lily links, a legend shortcut (`?water=lily&legend=1&sinker=1&light=dawn`, first surfacing at 15 s), and ten starred checks.
- **Art pending** (prompts 11–15): each is gated in `src/game/art/delivered.ts` so a missing file is never requested. Code stand-ins until then.

**Found by checking, not by looking:**
- **The rubric's legend numbers made it uncatchable:** take within 1.2 m but spook within 1.5 m. Now 1.6 / 0.7, with a unit test that take > spook + 0.3.
- **The first probe saw a moss bass take the old lure at 12 s,** the same moment the legend would: the primary fish was already on its way. Now other fish keep clear of that lure in the legend's water.
- **The weights were backwards:** a big moss bass weighs 49 lb, against the bench's "31 lb" legend. The legend is now the heaviest fish in its water (90 lb on the bench).
- **On a portrait phone the view is only about ±2 m at mid-pond** (a raycast of the camera frustum). The first pad layout sat half off-screen; everything is placed inside it now.
- **The bench and the found lure first sat against the lure buttons** (bottom left); moved onto the bank edge.
- **`/dev` logged a 404 on every production visit** (it asked a dev-only endpoint for the LAN address). It no longer asks in production; the shell spec had started failing on it.

**Checks:** 91 unit tests (waters, legend, visits, catchability, sinker lines, A4 links), 20 phone-profile e2e (new `a5-lily.spec`: walk there and back, remembered, card once; pad snag and free; both finds; strip never shows the old lure and untying works; legend: present, takes the old lure, a cast on top spooks it; lily link opens the lily pond).

Planted defects, each caught:
- A pad that does not snag fails the snag test.
- A walk that stays at the same water fails the walk test.
- A legend that takes a moving lure, or appears on an even visit, fails the unit tests.

Budget at the lily pond: 37–54 draws, 2.0–2.8k triangles. No console or page errors.

**Not testable here:** the feel of the walk on a phone (canon gate: two failures stop the shoreline at two waters), and whether the legend's tell reads as unmistakable on glass.
