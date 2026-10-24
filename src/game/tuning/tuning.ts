export const TUNING = {
  seed: {
    defaultSuffix: 'A'
  },
  session: {
    idRadix: 36,
    idSliceStart: 2,
    idSliceEnd: 10
  },
  world: {
    pondWidthM: 9,
    pondHeightM: 12,
    pondMarginRatio: 0.05,
    waterY: 0,
    fishDepthY: -0.08,
    lureSurfaceY: 0.06,
    lureSinkDepthY: -0.24,
    cameraPosition: [0, 6.2, 7.8] as [number, number, number],
    cameraTarget: [0, 0, 0] as [number, number, number],
    cameraFov: 38,
    rodTip: { x: 0.55, z: 3.05 },
    rodButt: { x: 0, z: 4.6 },
    rodTipY: 0.4,
    rodBendMaxM: 0.12,
    // Rod-in-hand (19_THE_FAR_WATER): butt pinned to the bottom-right corner,
    // doubled in size, leaning toward the aim point as you choose a cast.
    rodScreenButtXRatio: 0.95,
    rodScreenButtBottomMarginPx: 36,
    rodScreenButtBottomRatio: 0.012,
    rodScreenStrokeWidthPx: 8,
    rodScreenBowFraction: 0.04,
    rodReelOffsetPx: 13,
    rodReelScale: 2,
    rodAimLeanFraction: 0.2,
    lineSagAmplitudeY: 0.32,
    lureStart: { x: 0, z: -3.45 },
    fishStart: { x: -1.4, z: 1.35 },
    fishWanderRadiusM: 5.5,
    fishVisualWidthM: 0.9,
    fishVisualHeightM: 0.28,
    // Co-tuned with TUNING.visual.waterDeep/waterShallow: nudged 0.40 -> 0.46 to
    // recover ~half the silhouette contrast the deepened water costs, so a fish
    // still reads as a shadow you have to find — neither invisible nor a hard
    // black blob. The deep/shallow multipliers below keep their depth-fade ratio.
    fishCueOpacity: 0.46,
    fishCommitOpacity: 0.66,
    // Distance visibility (19_THE_FAR_WATER): a fish reads clearly in the near
    // water and fades into the dark out toward the far shore — the murk you cast
    // blind into, and the clarity you reel a hooked fish back into. Curve > 1 so
    // the far half goes murky fast. (Supersedes the old deep/shallow fade, which
    // made far fish *brighter* — backwards for the distance loop.)
    fishFarVisibility: 0.3,
    fishNearVisibility: 1.15,
    fishFarVisibilityCurve: 1.6,
    fishFadeMinMultiplier: 0.55,
    fishFadeMaxMultiplier: 1.15,
    fishFadeMinPeriodMs: 4200,
    fishFadeMaxPeriodMs: 7800,
    fishMaxVisible: 5,
    falseCueOpacity: 0.24,
    rippleHeightM: 0.012,
    rippleSegments: 48,
    waterSegments: 32,
    fishableMinZ: -5.4,
    fishableMaxZ: 1.8,
    // A hooked fish must stay on screen while it fights (don't let the flee
    // vector drag it off the visible water — pond half-width is 4.5m but the
    // camera frustum only shows ~±3.2m). Bound the fight to this arena: the fish
    // surges and pulls but is held inside the frame the player can see.
    hookedArenaHalfWidthM: 2.6,
    // The reveal (21_THE_REVEAL): a fish's SIZE is unreadable out in the dark and
    // resolves to its true size only as it comes near — so a hooked fish grows
    // into what it really is as you reel it in (and sometimes the big shadow turns
    // out small). Beyond revealNoneZ → generic ambiguous size; nearer than
    // revealFullZ → true species size; smoothstep between.
    revealNoneZ: -3,
    revealFullZ: 0.5,
    revealGenericWidthM: 0.7,
    revealGenericHeightM: 0.26,
    // The generic "smudge" twin shown while a fish is far/unknown uses ONE neutral
    // brightness instead of each species' own opacityMultiplier (0.78–1.08) — so a
    // far shadow can't betray its species by brightness. Dampened a touch so the
    // smudge isn't more spottable than the old per-species far shadow was.
    revealGenericOpacityMultiplier: 0.9,
    cameraLookAtLerp: 0.08
  },
  // Pond visual constants consumed by the WebGL scene (PondWater shader, fog,
  // backdrop). Deliberately DECOUPLED from the --water-deep/--water-shallow
  // :root CSS tokens, which still paint the loading screen, result card and
  // tune page in the original teal — darkening the pond here must NOT darken
  // those 2D surfaces. Lifted out of GameClient so the /dev gate can tune them.
  visual: {
    // Deepened ~halfway from the original #3d6068/#6a958f toward the art-bible
    // #1a2b30/#2f4948 (08_ART_DIRECTION). Partway, not all the way: at the full
    // art-bible depth a near-black fish silhouette vanishes. Co-tuned with
    // world.fishCueOpacity (0.46) for a readable-but-mysterious shadow.
    waterDeep: '#2b4750',
    waterShallow: '#4a6f6a',
    // The void around the pond and the distance fog, pushed toward ink so the
    // water stops dissolving into a same-colour background. Both were #3d6068
    // (identical to the old water) — which is exactly why they muddled together.
    voidColor: '#101c20',
    fogColor: '#101c20',
    fogNear: 10,
    fogFar: 18,
    // Moonlit caustics: dimmer overall and collapsing under Focus so the busy
    // light filaments stop competing with fish cues. Strength was a bare 0.5.
    causticStrength: 0.32,
    causticFocusMultiplier: 0.35,
    // The moon rises slowly through the session "like time is really passing"
    // (19_THE_FAR_WATER). A separate sprite in front of the treeline, not baked
    // into the canopy, so it can animate. Starts low near the crowns at the same
    // spot the old baked moon sat, and climbs into the sky over a few minutes.
    moonX: -3,
    moonZ: -6.4,
    moonRadiusM: 0.62,
    moonStartY: 0.45,
    moonRiseMaxY: 1.35,
    moonRiseMPerSec: 0.004,
    // Treeline backdrop placement — lifted for /dev tuning. A shorter plane
    // packs more of the full far shore (sky, crowns, moon, waterline) into the
    // camera-fixed horizon strip instead of showing only a band of mid-foliage.
    backdropY: 0.2,
    backdropHeight: 2.8,
    backdropTilt: 0.12,
    treelineVisibleTop: 0.4
  },
  input: {
    castPowerMin: 0.05,
    castPowerMax: 1,
    // Range now spans from just off the bank out to the far shore (19_THE_FAR_WATER).
    castMaxRangeM: 9.5,
    castVisibleHalfWidthM: 3.2,
    castMinForwardM: 0.25,
    // Accuracy falloff: a short cast lands true; a long cast scatters. The lure
    // is offset from the aim point by a random vector (deterministic per gesture)
    // whose radius grows from castSpreadNearM at the bank to castSpreadFarM at the
    // far shore. Curve > 1 so close casts stay tight and only long reaches blow
    // out. Near is near-zero (an exact landing point); far is a wide gamble zone.
    // castSpreadFarM is the ceiling at reachT=1; the longest cast the pond allows
    // only reaches reachT ~0.92-0.98, so the felt far ring tops out near ~1.45m.
    // The aim reticle renders this exact radius as a perspective ellipse on the
    // water, so what you see is the real landing zone (19_THE_FAR_WATER).
    castSpreadNearM: 0.04,
    castSpreadFarM: 1.65,
    castSpreadCurve: 1.8,
    castFlightTimeMin: 0.5,
    castFlightTimeMax: 1.2,
    castArcHeightM: 1.35,
    dragPowerPixels: 240,
    aimPreviewDots: 11,
    aimPreviewDotMinScale: 0.42,
    aimPreviewDotMaxScale: 1,
    aimPreviewLiftPx: 96,
    aimPreviewPowerPx: 180,
    lowerScreenStartRatio: 0.42,
    tapMoveTolerancePx: 10,
    rodTouchRadiusPx: 64,
    rodControlScreenPixels: 150,
    rodControlMaxOffsetM: 0.72,
    rodControlReturnRate: 7,
    rodControlLurePullMps: 1.15,
    rodControlLureAccel: 8,
    rodControlLureDamping: 2.5,
    rodControlLureMinSpeedMps: 0.02,
    rodControlTensionGain: 0.72,
    focusHoldMs: 1800,
    focusDurationMs: 1800,
    focusCooldownMs: 4000,
    focusGlareReduction: 0.6,
    focusWaterSpeedMultiplier: 0.7,
    // Tap-to-reel (replaces hold-to-reel). Each tap on a hooked fish fires one reel
    // pulse: a short window during which the existing reel pull (updateHookedContact-
    // Point) and the tension rise (updateFight) run, plus an instant tension burst.
    // Between taps the pulse expires and tension bleeds off — cadence is the skill.
    // tapReelPulseMs is how long one tap keeps the line coming in; keep it short so a
    // single tap is a discrete chunk of line, not a sustained hold. tapReelMinIntervalMs
    // debounces a physical double-fire (one finger tap = one pulse).
    tapReelPulseMs: 180,
    tapReelMinIntervalMs: 60,
    // Instant chunk of line (m) yanked in on the tap itself, on top of the pulse-window
    // pull, so a tap reads as an immediate jerk of the fish toward the rod (visual snap
    // of feedback). Clamped to the remaining distance in reelTap so it never overshoots.
    tapReelImpulse: 0.16
  },
  line: {
    lineSegments: 10,
    lineConstraintIterations: 4,
    lineGravity: 0.3,
    lineDamping: 0.98,
    lineSlackColour: '#d8d4c2',
    lineTautColour: '#e8c878',
    lineSnapColour: '#c84848',
    lineSlackWidthPx: 1.2,
    lineTautWidthPx: 2,
    lineSnapWidthPx: 2.5,
    lineHookWidthBoostPx: 1.3,
    lineVisualTautStart: 0.58,
    lineVisualTautFull: 0.9,
    lineSlackGravityMultiplier: 1.55,
    rodBendMaxDeg: 30
  },
  lure: {
    lureSinkRate: 0.4,
    lureWobbleAmplitude: 0.05,
    lureTwitchImpulse: 0.3,
    lureRadiusM: 0.09,
    lureFlashDurationMs: 180,
    lureTwitchDistanceM: 0.34,
    lureTwitchSidewaysRatio: 0.5,
    lureTwitchDurationMs: 180,
    lureBiteTugDurationMs: 620,
    lureBiteTugAmplitudeM: 0.12,
    lureBiteTugPulses: 4,
    lureHookJerkDistanceM: 0.42,
    rippleRadiusOnImpactM: 0.55,
    rippleRadiusOnTwitchM: 0.28,
    twitchPanicThresholdMs: 250,
    twitchOptimalGapMinMs: 800,
    twitchOptimalGapMaxMs: 2000
  },
  fish: {
    fishNoticeRadius: 2,
    fishFearRadius: 0.4,
    // Per-frame velocity damping for fish movement, normalized to a 60Hz frame
    // (applied as pow(damping, dt * 60) so the feel is identical at 120Hz).
    // Previously this borrowed TUNING.line.lineDamping — its own constant now so
    // tuning the fishing line can't silently change how fish swim.
    velocityDamping: 0.98,
    biteWindowMs: 600,
    fishStaminaDrainRate: 0.1,
    personalityScalar: 0.18,
    wanderSpeedMps: 0.28,
    noticeDurationMs: 700,
    approachSpeedMps: 0.78,
    inspectDurationMs: 1150,
    commitDurationMs: 520,
    biteNoHookMs: 900,
    fleeDurationMs: 1400,
    hookedPullSpeedMps: 0.8,
    reelContactPullMps: 1.15,
    hookedInitialStamina: 1,
    biteDistanceM: 0.38,
    inspectOrbitRadiusM: 0.44,
    cueRealEveryMs: 3600,
    cueFalseMinMs: 2000,
    cueFalseMaxMs: 6000,
    cueRippleDurationMs: 1700,
    cueShadowDurationMs: 6200,
    cueGlideAmplitudeM: 0.42,
    cueNoiseCount: 2,
    cueFlashDurationMultiplier: 0.32,
    cueSurfaceRiseDurationMultiplier: 0.42,
    cueLongDurationMultiplier: 0.62,
    cueRealPeakOpacity: 0.62,
    cueFalsePeakOpacity: 0.22,
    cueSiltOpacityMultiplier: 0.78,
    cueBubbleTrailCount: 4,
    // The reveal, completed (21_THE_REVEAL): below this resolve amount a fish's
    // cue reads as identity-free movement at a neutral radius (no species or size
    // tell); at/above it the species' own cue + radius show. Decor fish out in the
    // water emit their own cues on this interval so the whole pond feels alive —
    // every shadow is a real fish you could cast at, not just one.
    cueSpeciesRevealThreshold: 0.5,
    // The smallest species cue radius (== moon_minnow). A far cue is deliberately
    // the smallest size, never mid-range — so it can't whisper "this one's big";
    // the surprise always resolves UPWARD as the fish nears ("bigger than I'd
    // hoped"). A neutral-but-centred radius would itself leak size (21_THE_REVEAL).
    genericCueRadiusM: 0.16,
    decorCueMinMs: 3800,
    decorCueMaxMs: 8200,
    staminaLandThreshold: 0.1,
    earlyHookStates: ['approach', 'inspect', 'commit'] as const,
    catchMinSizeScore: 0.35,
    catchMaxSizeScore: 0.94,
    personalityModulation: 0.42,
    personalityHesitation: 0.45,
    fightSurgeRageBoost: 0.62,
    rageDecayPerSecond: 0.55,
    rageBaseline: 0.25,
    fishFacingMinSpeed: 0.04,
    fishFacingTurnRate: 5.5,
    species: {
      bronze_carp: {
        spawnWeight: 28,
        widthM: 0.95,
        heightM: 0.38,
        opacityMultiplier: 0.95,
        noticeRadiusMultiplier: 0.95,
        fearRadiusMultiplier: 0.8,
        commitThresholdMultiplier: 1.12,
        wanderSpeedMultiplier: 0.78,
        approachSpeedMultiplier: 0.75,
        inspectDurationMultiplier: 0.95,
        commitDurationMultiplier: 1.18,
        biteWindowMultiplier: 1.18,
        staminaDrainMultiplier: 1.05,
        hookedPullMultiplier: 0.82,
        cueEveryMultiplier: 0.95,
        primaryCueRadiusM: 0.22,
        surgeIntervalMinMs: 2100,
        surgeIntervalMaxMs: 4000,
        surgeTensionSpike: 0.18,
        surgeAudioIntensity: 0.55
      },
      moss_bass: {
        spawnWeight: 26,
        widthM: 0.9,
        heightM: 0.3,
        opacityMultiplier: 1,
        noticeRadiusMultiplier: 1.08,
        fearRadiusMultiplier: 1,
        commitThresholdMultiplier: 1,
        wanderSpeedMultiplier: 1,
        approachSpeedMultiplier: 1,
        inspectDurationMultiplier: 1.18,
        commitDurationMultiplier: 1,
        biteWindowMultiplier: 1,
        staminaDrainMultiplier: 1,
        hookedPullMultiplier: 1,
        cueEveryMultiplier: 1,
        primaryCueRadiusM: 0.18,
        surgeIntervalMinMs: 1700,
        surgeIntervalMaxMs: 3200,
        surgeTensionSpike: 0.22,
        surgeAudioIntensity: 0.6
      },
      moon_minnow: {
        spawnWeight: 22,
        widthM: 0.44,
        heightM: 0.14,
        opacityMultiplier: 1.08,
        noticeRadiusMultiplier: 1.22,
        fearRadiusMultiplier: 1.25,
        commitThresholdMultiplier: 0.72,
        wanderSpeedMultiplier: 1.6,
        approachSpeedMultiplier: 1.55,
        inspectDurationMultiplier: 0.52,
        commitDurationMultiplier: 0.58,
        biteWindowMultiplier: 0.62,
        staminaDrainMultiplier: 1.22,
        hookedPullMultiplier: 0.9,
        cueEveryMultiplier: 0.72,
        primaryCueRadiusM: 0.16,
        surgeIntervalMinMs: 600,
        surgeIntervalMaxMs: 1400,
        surgeTensionSpike: 0.08,
        surgeAudioIntensity: 0.32
      },
      old_kingfish: {
        spawnWeight: 8,
        widthM: 1.48,
        heightM: 0.46,
        opacityMultiplier: 0.78,
        noticeRadiusMultiplier: 0.82,
        fearRadiusMultiplier: 0.65,
        commitThresholdMultiplier: 1.45,
        wanderSpeedMultiplier: 0.55,
        approachSpeedMultiplier: 0.62,
        inspectDurationMultiplier: 2.1,
        commitDurationMultiplier: 1.35,
        biteWindowMultiplier: 0.86,
        staminaDrainMultiplier: 0.66,
        hookedPullMultiplier: 1.38,
        cueEveryMultiplier: 1.55,
        primaryCueRadiusM: 0.42,
        surgeIntervalMinMs: 3600,
        surgeIntervalMaxMs: 5500,
        surgeTensionSpike: 0.34,
        surgeAudioIntensity: 0.85
      },
      reed_pike: {
        spawnWeight: 16,
        widthM: 1.16,
        heightM: 0.18,
        opacityMultiplier: 0.9,
        noticeRadiusMultiplier: 1.15,
        fearRadiusMultiplier: 1.35,
        commitThresholdMultiplier: 0.78,
        wanderSpeedMultiplier: 1.22,
        approachSpeedMultiplier: 1.48,
        inspectDurationMultiplier: 0.68,
        commitDurationMultiplier: 0.48,
        biteWindowMultiplier: 0.78,
        staminaDrainMultiplier: 0.82,
        hookedPullMultiplier: 1.28,
        cueEveryMultiplier: 0.82,
        primaryCueRadiusM: 0.34,
        surgeIntervalMinMs: 950,
        surgeIntervalMaxMs: 1900,
        surgeTensionSpike: 0.26,
        surgeAudioIntensity: 0.7
      }
    }
  },
  tension: {
    lineSnapThreshold: 0.92,
    lineSlackEscapeThreshold: 0.05,
    slackEscapeWindowMs: 1500,
    hookedInitialTension: 0.35,
    tensionRiseRate: 0.6,
    tensionFallRate: 0.4,
    tensionReelBoost: 0.32,
    tensionBurstRate: 0.22,
    tensionSlackFallRate: 0.42,
    // Tap-to-reel tension model. Each tap adds tensionPerTap instantly (the jolt of
    // cranking the handle); between taps tension falls at tensionTapDecayRate so a
    // pause lets the line bleed off before it snaps. During a tap's pulse window
    // tension still climbs continuously (the held-reel rise in updateFight), so
    // sustained rapid tapping stacks bursts on top of the rise and drives toward the
    // snap threshold — exactly the cadence skill (tap to gain line, pause to recover).
    tensionPerTap: 0.11,
    tensionTapDecayRate: 0.9,
    tensionSafeHold: 0.48,
    tensionSweetSpotMin: 0.35,
    tensionSweetSpotMax: 0.68,
    nearSnapThreshold: 0.85,
    splashHighTension: 0.7
  },
  // Pre-cast gear (22_THE_GEAR): two rods + three lures as sidegrades that deepen
  // the distance gamble — NOT an upgrade ladder. Every DEFAULT-gear field is 1.0,
  // so default play is byte-for-byte today's validated feel; the iPhone gate judges
  // only the deltas. Rods: rangeMult scales how far a full cast throws; accuracyMult
  // scales the landing-spread (smaller = tighter); lineStrengthMult scales the snap
  // thresholds (smaller = snaps easier). Lures: attractMult/fearMult scale the fish
  // notice/fear radii (the two AI levers that decide how cast inaccuracy cashes out);
  // sinkMult/twitchMult are presentation feel. Canon: 22_THE_GEAR.
  gear: {
    defaultRodId: 'long',
    defaultLureId: 'natural',
    rods: {
      // The long rod (default): reaches the far dark, today's exact feel.
      long: { rangeMult: 1, accuracyMult: 1, lineStrengthMult: 1 },
      // The short rod: can't reach the dark, lands near-exact, fights on a tight
      // margin (snaps easier). A deliberate renunciation of the long gamble.
      short: { rangeMult: 0.6, accuracyMult: 0.5, lineStrengthMult: 0.82 }
    },
    lures: {
      // The natural lure (default): balanced draw and nerve, today's exact feel.
      natural: { attractMult: 1, fearMult: 1, sinkMult: 1, twitchMult: 1 },
      // The loud lure: big draw (rescues a loose far cast) paid for with a big fear
      // radius (spooks easily — twitchy to handle).
      popper: { attractMult: 1.6, fearMult: 1.5, sinkMult: 0.6, twitchMult: 1.3 },
      // The quiet lure: won't spook even worked close (small fear) but draws only
      // from nearby (small attraction) — demands you place it true.
      sinker: { attractMult: 0.7, fearMult: 0.6, sinkMult: 1.5, twitchMult: 0.85 }
    }
  },
  timing: {
    msPerSecond: 1000,
    // Ceiling on a single simulation step. A long frame (tab switch back, GC
    // pause) otherwise delivers one huge dt that can tunnel straight through a
    // bite window or snap the line in a single step.
    maxFrameDtSeconds: 0.05,
    tapFadeMs: 600,
    wordmarkFadeMs: 800,
    resultTextDelayMs: 800,
    resultTextFadeMs: 400,
    resultButtonDelayMs: 200,
    resultDismissLockMs: 1000,
    resultAutoDismissMs: 6000,
    missedPromptMs: 1200,
    escapePromptMs: 1000,
    snapSilenceMs: 1500,
    snapAnimationMs: 1500,
    hookJerkMs: 180,
    debugSampleMs: 1000,
    debugFiveSecondMs: 5000
  },
  performance: {
    fpsFloor: 30,
    fpsRecovery: 55,
    // Ceiling on a single frame's measured fps (ProMotion is 120). Must sit
    // above fpsRecovery or recovery can never trigger.
    fpsSampleCap: 120,
    degradeHoldMs: 5000,
    recoverHoldMs: 10000,
    pixelRatioCap: 2,
    pixelRatioMin: 1,
    pixelRatioStep: 0.5,
    particleBaseCount: 16,
    particleReducedMultiplier: 0.5,
    lowMotionMultiplier: 0.3,
    // Ripple/cue meshes are pushed into React state as cues fire and were only
    // ever cleared on a fresh cast. Within one cast cycle (idle scouting fires a
    // false cue every cueFalseMin..Max ms forever) they accumulated without
    // bound — draw calls and triangles climbed monotonically (measured 15->63
    // draw calls over 60s idle, breaching the <50 budget at ~40s). Sweep expired
    // ripples on this cadence so each ripple's mesh/geometry/material unmounts
    // once it has fully faded. Cheap throttle: at most a few sweeps per second,
    // and only when something actually expired (no needless re-render churn).
    rippleSweepIntervalMs: 400,
    // Grace past durationMs before a ripple is reaped. A ripple's opacity reaches
    // 0 exactly at durationMs (WaterRipple: (1 - progress) * peak), so anything
    // older is already invisible. Keep a small margin so a sweep never pops a
    // ripple a frame before it finishes its last visible frame.
    rippleSweepGraceMs: 120
  },
  audio: {
    masterGain: 0.7,
    ambientGain: 0.46,
    sfxGain: 1,
    musicGain: 0,
    beginConfirmHz: 220,
    beginConfirmMs: 90,
    beginConfirmGain: 0.24,
    whooshMs: 200,
    plopMs: 80,
    twitchMs: 40,
    nibbleTickMs: 30,
    nibbleGapMs: 58,
    hookMs: 180,
    snapMs: 200,
    catchMs: 800,
    splashMs: 260,
    escapeMs: 340,
    lineZipMinTension: 0.4,
    lineZipFrequencyHz: 200,
    reelClickMinIntervalMs: 70,
    reelClickMaxIntervalMs: 220,
    reelClickGain: 0.11,
    reelClickFilterStartHz: 900,
    reelClickFilterEndHz: 700,
    lineStrainMinTension: 0.78,
    lineStrainGain: 0.16,
    lineStrainPitchRise: 1,
    rodLoadTickMinTension: 0.35,
    rodLoadTickGain: 0.045,
    ambientFilterHz: 200,
    ambientBufferSeconds: 1,
    ambientNoiseStep: 0.12,
    ambientNoiseDamping: 0.96,
    impactSplashIntensity: 0.32,
    missedSplashIntensity: 0.42,
    struggleSplashIntensity: 0.7,
    thrumFrequencyHz: 60,
    thrumGain: 0.1
  },
  // The drifting light (23_ALPHA_CANON §3). Four graded lights on one cycle:
  // dawn 0, day 0.25, dusk 0.5, night 0.75. A visit starts somewhere the game
  // chooses, drifts slowly, and the pond remembers where it was. Colours are
  // sRGB hex; the scene converts them to linear once per frame without
  // allocating. `treeline` is a MULTIPLIER on the painted treeline texture
  // (white = as painted), not a colour. Day is graded to reference photo 01, dawn/dusk lean on 05,
  // night keeps the v0.4 moonlit palette so the old mood survives.
  light: {
    // One light (a quarter of the cycle) lasts ~10 minutes.
    cyclePerSecond: 1 / 2400,
    // Fraction of each quarter spent holding its own light before blending
    // toward the next one (0 = constant blend, 0.5 = hard cuts).
    plateau: 0.28,
    // A first-ever visit opens late in the day so the first thing a player
    // sees is the dusk turn (the hero light).
    firstVisitPhase: 0.43,
    // A return visit jumps forward by this much of the cycle, so it starts at
    // a different light than the one the player left.
    returnJumpMin: 0.2,
    returnJumpMax: 0.55,
    // Phase persistence cadence while playing.
    saveEveryMs: 15000,
    keys: {
      dawn: {
        skyZenith: '#56677f', skyHorizon: '#e3b394', fog: '#4a5560',
        waterShallow: '#6b8a86', waterDeep: '#33484f', waterFar: '#26333a',
        treeline: '#a39ea6', bank: '#9a8a78', ambient: '#c9b9b0', key: '#ffd3ae',
        ambientIntensity: 0.75, keyIntensity: 1.1, exposure: 1.0,
        glint: 0.7, sheen: 0.3, caustic: 0.12, reflect: 0.9,
        celestialElevation: 9, celestialAzimuth: -38, sunVisibility: 1, moonVisibility: 0, stars: 0.05,
        mist: 0.85, midges: 0.1, ground: '#a39a96'
      },
      day: {
        skyZenith: '#6b9cc4', skyHorizon: '#d7e6e4', fog: '#8fa69c',
        waterShallow: '#6e8d55', waterDeep: '#3c5a3c', waterFar: '#2b3e2f',
        treeline: '#f2f4ea', bank: '#b9aa86', ambient: '#e8efe6', key: '#fff6e2',
        ambientIntensity: 1.05, keyIntensity: 1.6, exposure: 1.0,
        glint: 0.2, sheen: 0.1, caustic: 0.3, reflect: 0.7,
        celestialElevation: 52, celestialAzimuth: 18, sunVisibility: 1, moonVisibility: 0, stars: 0,
        mist: 0, midges: 0, ground: '#cfd3c2'
      },
      dusk: {
        skyZenith: '#34405f', skyHorizon: '#e0875b', fog: '#3a3540',
        waterShallow: '#5a6a6a', waterDeep: '#263840', waterFar: '#1b2328',
        treeline: '#8f727a', bank: '#8c7464', ambient: '#a99aa8', key: '#ffb07a',
        ambientIntensity: 0.7, keyIntensity: 1.05, exposure: 1.05,
        glint: 1.15, sheen: 0.45, caustic: 0.08, reflect: 0.95,
        celestialElevation: 6, celestialAzimuth: 24, sunVisibility: 1, moonVisibility: 0.15, stars: 0.12,
        mist: 0.25, midges: 1, ground: '#7d6863'
      },
      night: {
        skyZenith: '#0c1820', skyHorizon: '#2b3d47', fog: '#101c20',
        waterShallow: '#3f5f5c', waterDeep: '#243d45', waterFar: '#111d21',
        treeline: '#7f9092', bank: '#6e6656', ambient: '#9fb2b4', key: '#c8d4dc',
        ambientIntensity: 0.85, keyIntensity: 0.9, exposure: 0.95,
        glint: 0.7, sheen: 0.3, caustic: 0.2, reflect: 0.85,
        celestialElevation: 26, celestialAzimuth: -22, sunVisibility: 0, moonVisibility: 1, stars: 1,
        mist: 0.45, midges: 0.55, ground: '#3d4b4e'
      }
    }
  },
  // The A1 water (23_ALPHA_CANON §7): analytic waves + Schlick fresnel + sky
  // reflection + glint + distance darkening, with fish drawn into the water.
  water: {
    // Schlick F0 for water.
    fresnelF0: 0.02,
    // Distance (0 = bank, 1 = far shore, in uv.y) where the body colour is
    // fully the deep colour, and the curve that gets it there.
    clarityDeepAt: 0.62,
    clarityCurve: 1.6,
    // How strongly the far band is pulled toward waterFar (the dark gamble zone).
    farDarkStart: 0.45,
    farDarkStrength: 0.85,
    // Analytic wave field (three directional cosines) — amplitude is slope.
    waveScale: 3.1,
    waveSlope: 0.055,
    waveSpeed: 0.55,
    // Fine detail from the existing normal map, layered under the waves.
    detailSlope: 0.32,
    // Band of the reflected sky near the horizon that the far treeline darkens.
    // Reflections pointing below this height (R.y) toward the far shore hit
    // the treeline instead of sky; fades in with distance so near water
    // reflects sky and far water reflects trees (reference photos 01, 02).
    treelineBand: 0.5,
    treelineReflectBase: '#2a3a2b',
    // Fresnel alone is near zero from a bank-height camera; this maps it to a
    // usable reflection weight (floor near, gain toward the grazing far water).
    reflectGain: 4,
    reflectFloor: 0.08,
    reflectMax: 0.92,
    glintSharp: 96,
    glintBroad: 12,
    // Fish in the water: darkening of the water body above a fish and the
    // surface slope its body pushes up. Radius is a multiple of fish width.
    fishShadowStrength: 0.38,
    fishShadowRadiusMul: 0.75,
    fishBulgeSlope: 0.05
  },
  // A2 — the bank (23_ALPHA_CANON §10, reference photo 01). The near edge of
  // the water is a row of rounded stones half in the water; weeds and clover
  // on the bank; reeds at the side banks; layered far trees; mist and midges
  // driven by the light (light.keys.*.mist / .midges).
  bank: {
    // World z of the water's visible near edge (where the bank plane meets
    // y = 0); the old Foreshore placement, now named.
    edgeZ: 2.5,
    stoneCount: 17,
    stoneSpanX: 4.9,
    // Stone half-extents (m): low boulders with gaps between, like photo 01
    // (first pass at 0.26-0.5 wide / 0.16-0.32 tall read as a solid wall).
    stoneWidthMin: 0.2,
    stoneWidthMax: 0.38,
    stoneHeightMin: 0.12,
    stoneHeightMax: 0.23,
    stoneDepthMin: 0.17,
    stoneDepthMax: 0.3,
    // Stones sit ON the edge, a touch back, so they hide as little of the
    // castable near water as possible (A2 rubric item 6).
    stoneEdgeOffsetZ: 0.06,
    stoneEdgeJitterZ: 0.1,
    weedTuftCount: 150,
    weedBladeCount: 7,
    weedHeightMin: 0.07,
    weedHeightMax: 0.2,
    weedSway: 0.12,
    reedClumpCount: 40,
    reedSway: 0.07,
    // Water darkens over this many metres before the stones (the wet edge).
    shoreBandM: 0.45,
    shoreDarken: 0.35,
    // Far-tree layers: the back row is pulled toward the fog colour.
    treeBackHaze: 0.45,
    mistBankCount: 9,
    mistOpacity: 0.85,
    midgeCount: 120,
    midgeSizePx: 2.6
  },
  // A3 — habits (23_ALPHA_CANON §4, docs/alpha/A3_RUBRIC.md). The home pond
  // made learnable: homes, feeding lights, the spook rule, the still lure.
  // All data; nothing here is ever shown or named in UI.
  habits: {
    // Home features on the home pond, world metres (fishable band is
    // z -5.4 .. 1.8, x ±4.05; the stones are along z ≈ 2.5).
    homes: {
      stones: { x: -2.1, z: 1.0, radius: 1.3 },
      reeds_left: { x: -3.5, z: -1.4, radius: 1.1 },
      reeds_right: { x: 3.5, z: -0.4, radius: 1.1 },
      deep: { x: 0.6, z: -4.5, radius: 1.3 },
      open: { x: 0, z: -1.6, radius: 3.0 }
    },
    // Which homes each species takes (first listed most often).
    speciesHomes: {
      bronze_carp: ['stones', 'stones', 'open'],
      moss_bass: ['reeds_left', 'reeds_right', 'stones'],
      moon_minnow: ['open'],
      old_kingfish: ['deep'],
      reed_pike: ['reeds_left', 'reeds_right']
    },
    // The light(s) each species feeds at.
    feedingLights: {
      bronze_carp: ['day'],
      moss_bass: ['dawn'],
      moon_minnow: ['dusk', 'night'],
      old_kingfish: ['night'],
      reed_pike: ['dusk']
    },
    // Half-width of a feeding window around its light, in cycle phase (a
    // quarter is one light), smoothstepped to 0 at the edge.
    feedingHalfWidth: 0.16,
    // Off its light a fish keeps within its home radius; feeding widens the
    // roam by this factor and pulls it this many metres toward the near water.
    feedingRoamMul: 2.2,
    feedingShoreward: 1.8,
    // Speed and curiosity off-feed (0) vs feeding (1). A3.1: widened (was
    // 0.7 / 1.25) because the owner could not tell the ponds apart.
    speedOffFeed: 0.55,
    speedFeeding: 1.45,
    noticeOffFeed: 0.7,
    noticeFeeding: 1.3,
    // Cue interval multipliers: feeding fish ripple far more often, idle fish
    // far less, so a busy patch of water reads at a glance (A3.1; was 0.5 / 1).
    cueIntervalFeeding: 0.3,
    cueIntervalOffFeed: 1.7,
    // The spook rule: a splash this close (× species fear × lure fear) sends
    // the fish to the far dark for a while. Feeding fish are bolder.
    splashSpookRadiusM: 0.75,
    splashSpookFeedingRelief: 0.35,
    spookHoldMinMs: 18000,
    spookHoldMaxMs: 34000,
    spookFarBandM: 1.3,
    spookSideReachM: 1.6,
    // A3.1: a spook is an EVENT. The fish bolts at this multiple of its
    // approach speed for this long, trailing a V-wake; fish within the scatter
    // radius of it bolt too, for a shorter hold.
    spookBurstMs: 1200,
    spookBurstMul: 3.2,
    spookWakeEveryMs: 160,
    spookWakeRadiusM: 0.42,
    scatterRadiusM: 1.6,
    scatterHoldMul: 0.45,
    // The still lure: how long the lure must be dead still before this
    // species will commit, off-feed. Feeding discounts it.
    stillLureMs: {
      bronze_carp: 2600,
      moss_bass: 0,
      moon_minnow: 0,
      old_kingfish: 5200,
      reed_pike: 0
    },
    stillFeedingDiscount: 0.55,
    // A fish waiting on a still lure loses interest after this long.
    stillGiveUpMs: 9000,
    // The ring around the lure: closes over this long of stillness.
    stillRingFullMs: 5200,
    stillRingMaxOpacity: 0.62,
    // A3.1: a fish waiting for a still lure nudges at it: a small ring at the
    // lure this often, so the player can see something wants it.
    waitingNudgeEveryMs: 1300
  },
  // A4 the wall (docs/alpha/A4_RUBRIC.md). Weight from length by W = a·L^b
  // (grams, cm), the fisheries length-weight relation, with per-species
  // coefficients near their real-world cousins. Shown in lb and oz.
  wall: {
    weight: {
      bronze_carp: { a: 0.0141, b: 3.0 },
      moss_bass: { a: 0.0117, b: 3.1 },
      moon_minnow: { a: 0.006, b: 3.0 },
      old_kingfish: { a: 0.0186, b: 2.9 },
      reed_pike: { a: 0.0049, b: 3.1 }
    },
    // The note on the pond after keep / let go shows for this long.
    swapNoteMs: 3200,
    // A visit ends after this long away (or when you leave the pond).
    visitIdleMs: 30 * 60 * 1000,
    // A released fish's ripple at the bank.
    releaseRippleM: 0.6
  },
  // A4 the link: the arrival silhouette where the sender hooked the fish.
  link: {
    maxCodeChars: 400,
    ghostOpacity: 0.7,
    // A gold ring on the water around the spot, so a stranger sees which dark
    // shape is THE spot (owner, 24 Oct 2026: "No spot seen?").
    markerRadiusM: 0.75,
    markerOpacity: 0.85,
    ghostPulseHz: 0.5,
    // After "Start fishing" the silhouette fades over this long.
    ghostFadeMs: 9000
  },
  haptics: {
    tapBegin: [10],
    nibbleTick: [15],
    hookset: [20, 40, 20],
    tensionPulse: [30],
    // One crisp tick per reel tap — immediate "the crank caught" feedback.
    reelTap: [12],
    lineSnap: [80],
    catch: [10, 30, 10, 30, 60],
    // A personal best deserves a longer, celebratory pattern than a plain
    // catch — three rising pulses into a held one.
    personalBest: [15, 40, 15, 40, 15, 40, 110],
    missed: [10],
    escape: [15, 15],
    fishSurge: [25, 35, 20],
    tensionRepeatMs: 200
  },
  ui: {
    debugDefaultDev: true,
    debugPanelMaxRows: 14,
    landscapeMinAspect: 1.05,
    minTouchTargetPx: 44,
    safeOverlayOpacity: 0.72,
    resultMaxWidthPx: 360,
    lineSvgPaddingPx: 8,
    worldProjectScale: 44,
    worldProjectOffsetXRatio: 0.5,
    worldProjectOffsetYRatio: 0.66,
    hookJerkScreenPx: 22,
    reelHintTensionWarn: 0.72,
    // Fight drama (11_FAILURE_AESTHETICS adjacent — losing should LOOM first):
    // a fish surge nudges the camera for surgeShakeMs, and a red vignette
    // breathes in from the screen edges as tension closes on the snap line,
    // starting at dangerVignetteStartRatio of the effective near-snap warning.
    surgeShakeMs: 280,
    surgeShakeAmplitudeM: 0.05,
    // A snap is the loudest moment in the game (11_FAILURE_AESTHETICS): the
    // longer window overdrives the same decay curve (remaining/surgeShakeMs
    // exceeds 1 at first), so the snap jolt starts harder than any surge.
    snapShakeMs: 460,
    dangerVignetteStartRatio: 0.9,
    // First-session coaching: the twitch hint dismisses itself after this long
    // so the water never stays captioned.
    coachHintAutoHideMs: 5200
  }
} as const;

export type Tuning = typeof TUNING;
