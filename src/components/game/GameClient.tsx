'use client';

/* eslint-disable @next/next/no-img-element */
import { Canvas } from '@react-three/fiber';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { IosInstallHint } from '@/components/pwa/IosInstallHint';
import { OfflineStatus } from '@/components/pwa/OfflineStatus';
import { ProceduralAudio } from '@/game/audio/procedural';
import { type FishCueKind } from '@/game/fish/species';
import { DEFAULT_LURE_ID, DEFAULT_ROD_ID, isLureId, isRodId, lureMods, rodMods } from '@/game/gear/gear';
import { personalBestFor } from '@/game/fish/personalBest';
import { setHapticsEnabled, vibrate } from '@/game/haptics/haptics';
import { defaultPrefs, getPrefs, setPrefs, type Prefs } from '@/game/persistence/prefsStore';
import { getGear, setGear, type GearSelection } from '@/game/persistence/gearStore';
import { add, clamp, clampToPond, lerp, normalize, scale, sub, type Vec2 } from '@/game/math/vec';
import { createId, dailySeed, type Catch, type Failure, useSessionStore } from '@/game/persistence/sessionStore';
import { useGameStore } from '@/game/state/gameStore';
import type { FailureKind, ResultCatch } from '@/game/state/gameStateMachine';
import { TUNING } from '@/game/tuning/tuning';
import { track } from '@/game/telemetry/track';
import { failureStory, generateStory } from '@/game/ui/storyGenerator';
import { CatchResultCard } from '@/components/game/CatchResultCard';
import { XRAY_COLORS } from '@/components/game/scene/XRay';
import { AUTHOR } from '@/lib/author';
import { WallBoard } from '@/components/game/WallBoard';
import { TackleBag } from '@/components/game/TackleBag';
import { ART_DELIVERED } from '@/game/art/delivered';
import { arriveAt, loadShore, saveShore, type Shore } from '@/game/persistence/shoreStore';
import { createLegendState, legendThisVisit, type LegendState } from '@/game/waters/legend';
import { isWaterId, WATERS, type WaterId } from '@/game/waters/waters';
import { isLegend } from '@/game/fish/species';
import { seededRandom } from '@/game/math/vec';
import { arrivalLine, decodeCatchLink, lightWord } from '@/game/share/catchLink';
import { SPECIES_STORY_LABELS, SPECIES_IDS, type SpeciesId } from '@/game/fish/species';
import { endVisit, formatWeight, keepFish, keeperOfVisit, loadWall, releaseFish, saveWall, touchVisit, wallLines, weightGrams, type Keeper } from '@/game/wall/wall';
import { DebugHud } from '@/components/game/DebugHud';
import { GameScene } from '@/components/game/GameScene';
import { GearSelect, lureGlyph } from '@/components/game/GearSelect';
import { RodReel, rodPathFromScreen } from '@/components/game/RodReel';
import { TourOverlay, type TourApi } from '@/components/game/TourOverlay';
import { tourFor } from '@/game/tour/tours';
import {
  canPendingTouchBecomeCast,
  clampRodOffset,
  clampToFishableWater,
  createRuntime,
  distancePointToSegment,
  isEarlyHookAttempt,
  rodTipForRuntime,
  scheduleNextSurge,
  lureStillMs,
  spookFromSplash
} from '@/components/game/runtime';
import type {
  AimPreview,
  FocusIndicator,
  Overlay,
  PointerSnapshot,
  Ripple,
  Runtime,
  ScreenPoint,
  ViewportSize
} from '@/components/game/types';

export function GameClient({ arrivalCode }: { arrivalCode?: string } = {}) {
  const searchParams = useSearchParams();
  // A4: a catch link (/c/<code>, or ?catch=<code>) regrows the sender's pond.
  // A code that does not decode is ignored: the normal title screen.
  const arrival = useMemo(() => decodeCatchLink(arrivalCode ?? searchParams.get('catch')), [arrivalCode, searchParams]);
  const seed = arrival?.seed ?? searchParams.get('seed') ?? dailySeed();
  const baseSpawn = arrival?.spawnIndex ?? 0;
  // A5: which water you are at. A catch link wins; then `?water=` (review);
  // then where you were last time. waterRef is what the runtime closures
  // read (a water change must not re-run the title reset); `water` renders.
  const [shore, setShoreState] = useState<Shore>(() => loadShore());
  const initialWater: WaterId = arrival?.water
    ?? (isWaterId(searchParams.get('water')) ? (searchParams.get('water') as WaterId) : shore.water);
  const [water, setWater] = useState<WaterId>(initialWater);
  const waterRef = useRef<WaterId>(initialWater);
  // Review switches (owner, /ab): the legend present this visit, the old
  // sinking lure already found. Never linked from the game.
  const forceLegend = searchParams.get('legend') === '1';
  const forceSinker = searchParams.get('sinker') === '1';
  const foundSinker = shore.foundSinker || forceSinker;
  const sinkerTiedRef = useRef(shore.sinkerTied && foundSinker);
  const legendRef = useRef<LegendState | null>(null);
  const [walking, setWalking] = useState(false);
  const walkingRef = useRef(false);
  const [waterCard, setWaterCard] = useState<WaterId | null>(null);
  const updateShore = useCallback((fn: (current: Shore) => Shore) => {
    const next = fn(loadShore());
    saveShore(next);
    setShoreState(next);
    return next;
  }, []);
  const queryDebug = searchParams.get('debug') === '1';
  // The review tour (?tour=<chapter>, docs/alpha/TOUR.md) drives the same
  // review hooks as ?debug=1, without the debug panel.
  const tour = useMemo(() => tourFor(searchParams.get('tour')), [searchParams]);
  const reviewHooks = queryDebug || tour !== null;
  const queryXray = searchParams.get('xray') === '1';
  const [started, setStarted] = useState(false);
  const [debugOpen, setDebugOpen] = useState(queryDebug || (process.env.NODE_ENV === 'development' && TUNING.ui.debugDefaultDev));
  const [aimPreview, setAimPreview] = useState<AimPreview | null>(null);
  const [overlay, setOverlay] = useState<Overlay>({ linePoints: [], rodTip: { x: 0, y: 0 }, lure: { x: 0, y: 0 }, aimTarget: null });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [rodOffset, setRodOffset] = useState<Vec2>({ x: 0, z: 0 });
  // Boot at the device's real ratio (capped). Starting at 1 regardless of
  // device left every iPhone rendering at a third of its pixels, and the first
  // 'degrade' step then RAISED resolution on a struggling phone.
  const [pixelRatio, setPixelRatio] = useState(() =>
    typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio, TUNING.performance.pixelRatioCap)
  );
  const [restoring, setRestoring] = useState(false);
  const [landscape, setLandscape] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize | null>(null);
  const [resultDismissReady, setResultDismissReady] = useState(false);
  const [focusActive, setFocusActive] = useState(false);
  const [focusIndicators, setFocusIndicators] = useState<FocusIndicator[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<PointerSnapshot | null>(null);
  const focusTimeoutRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const spawnIndexRef = useRef(baseSpawn);
  // A4: the visit (one session) a keeper belongs to; the wall overlay; the
  // short note on the pond after keep / let go.
  const visitIdRef = useRef<string>('');
  const [wallOpen, setWallOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [arrivalTitle, setArrivalTitle] = useState<{ key: number; name: string; light: string } | null>(null);
  const [wallHighlight, setWallHighlight] = useState<string | null>(null);
  const [pondNote, setPondNote] = useState<string | null>(null);
  const pondNoteTimer = useRef<number | null>(null);
  const audio = useRef(new ProceduralAudio());
  const setGameState = useGameStore((state) => state.setGameState);
  const setFishState = useGameStore((state) => state.setFishState);
  const setSeed = useGameStore((state) => state.setSeed);
  const setReeling = useGameStore((state) => state.setReeling);
  const setTension = useGameStore((state) => state.setTension);
  const sessionStore = useSessionStore();
  const gameState = useGameStore((state) => state.gameState);
  const fishState = useGameStore((state) => state.fishState);
  const tension = useGameStore((state) => state.tension);
  const lureState = useGameStore((state) => state.lureState);
  const debugMetrics = useGameStore((state) => state.debugMetrics);
  const glHandlersReady = useGameStore((state) => state.glHandlersReady);

  const runtime = useRef<Runtime>(createRuntime(seed, baseSpawn, initialWater));

  // Pre-cast gear (22_THE_GEAR). gearRef is the always-current selection the
  // runtime + cast closures read; `gear` drives the picker UI. Saved gear loads on
  // mount (client-only — avoids a hydration mismatch) and is re-stamped onto the
  // runtime after every reset so a fresh cast keeps the chosen loadout.
  const gearRef = useRef<GearSelection>({ rodId: DEFAULT_ROD_ID, lureId: DEFAULT_LURE_ID });
  const [gear, setGearState] = useState<GearSelection>({ rodId: DEFAULT_ROD_ID, lureId: DEFAULT_LURE_ID });
  const stampGear = useCallback(() => {
    runtime.current.rodId = gearRef.current.rodId;
    // A5: the found lure, tied on, outranks the strip until untied.
    runtime.current.lureId = sinkerTiedRef.current ? 'old_sinker' : gearRef.current.lureId;
    runtime.current.legend = legendRef.current;
  }, []);
  useEffect(() => {
    const saved = getGear();
    gearRef.current = saved;
    setGearState(saved);
    stampGear();
  }, [stampGear]);
  const applyGear = useCallback((selected: GearSelection) => {
    // While the old sinking lure is tied on, the strip is shown with no lure
    // chosen; changing the rod keeps it tied (the strip's own lure stays).
    const rodOnly = selected.lureId === 'old_sinker';
    const next = rodOnly ? { ...selected, lureId: gearRef.current.lureId } : selected;
    // Choosing any lure in the strip takes the old sinking lure off.
    if (!rodOnly && sinkerTiedRef.current) {
      sinkerTiedRef.current = false;
      updateShore((current) => ({ ...current, sinkerTied: false }));
    }
    gearRef.current = next;
    setGearState(next);
    setGear(next);
    stampGear();
  }, [stampGear, updateShore]);

  // Feel preferences (sound / haptics): loaded client-side like gear, applied
  // to the audio bus and the central haptics gate immediately on change.
  const [prefs, setPrefsState] = useState<Prefs>(defaultPrefs());
  useEffect(() => {
    const saved = getPrefs();
    setPrefsState(saved);
    audio.current.setMuted(!saved.audio);
    setHapticsEnabled(saved.haptics);
  }, []);
  const togglePref = useCallback((key: 'audio' | 'haptics') => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefsState(next);
    setPrefs(next);
    audio.current.setMuted(!next.audio);
    setHapticsEnabled(next.haptics);
    if (key === 'haptics' && next.haptics) {
      // A single confirming pulse so re-enabling haptics answers in kind.
      vibrate(15);
    }
  }, [prefs]);

  // First-session coaching: two quiet, diegetic hints (read the water → cast;
  // twitch the lure) shown once ever, then the pond goes wordless for good.
  // The bite/fight prompts ("Tap!", "Ease off") are permanent HUD, not coaching.
  const [coachHint, setCoachHint] = useState<string | null>(null);
  const coachRef = useRef({ cast: false, twitch: false, done: false });
  useEffect(() => {
    try {
      if (window.localStorage.getItem('reelmobile.coach.v1') === '1') {
        coachRef.current.done = true;
      }
    } catch {
      // Private mode: coach once per load instead.
    }
  }, []);
  useEffect(() => {
    if (!started || coachRef.current.done) {
      return undefined;
    }
    const kind = gameState.kind;
    if (kind === 'scouting' && !coachRef.current.cast) {
      coachRef.current.cast = true;
      setCoachHint('Read the water — drag to cast toward a ripple.');
      return undefined;
    }
    if (kind === 'lure_idle' && !coachRef.current.twitch) {
      coachRef.current.twitch = true;
      setCoachHint('Tap to twitch the lure. Movement draws eyes.');
      const timeout = window.setTimeout(() => setCoachHint(null), TUNING.ui.coachHintAutoHideMs);
      return () => window.clearTimeout(timeout);
    }
    if (kind === 'aiming' || kind === 'casting' || kind === 'bite_window' || kind === 'hooked') {
      setCoachHint(null);
      return undefined;
    }
    if (kind === 'result') {
      coachRef.current.done = true;
      setCoachHint(null);
      try {
        window.localStorage.setItem('reelmobile.coach.v1', '1');
      } catch {
        // ignore
      }
    }
    return undefined;
  }, [gameState.kind, started]);

  // The rod/lure explainer is opened from the gear strip but it pauses the pond,
  // so the open-state lives here (not inside GearSelect): the runtime needs to see
  // it. Frozen only while the explainer is open AND we're scouting; the cleanup +
  // the leave-scouting reset guarantee the freeze can never leak into a cast.
  const [gearHelpOpen, setGearHelpOpen] = useState(false);
  useEffect(() => {
    runtime.current.pondFrozen = (gearHelpOpen || bagOpen) && gameState.kind === 'scouting';
    return () => {
      runtime.current.pondFrozen = false;
    };
  }, [bagOpen, gearHelpOpen, gameState.kind]);
  useEffect(() => {
    if (gameState.kind !== 'scouting' && gearHelpOpen) {
      setGearHelpOpen(false);
    }
  }, [gameState.kind, gearHelpOpen]);

  // Back to the title screen with a fresh pond: the same reset a new seed
  // does. Used on mount/seed change and by the "leave the pond" glyph.
  const resetToTitle = useCallback(() => {
    spawnIndexRef.current = baseSpawn;
    runtime.current = createRuntime(seed, baseSpawn, waterRef.current);
    if (arrival) {
      runtime.current.ghost = { species: arrival.species, pos: { ...arrival.hook }, fadeFrom: null };
    }
    stampGear();
    startedRef.current = false;
    setStarted(false);
    setSeed(seed);
    setGameState({ kind: 'splash' });
    setFishState(runtime.current.fish.state);
  }, [arrival, baseSpawn, seed, setFishState, setGameState, setSeed, stampGear]);

  useEffect(() => {
    resetToTitle();
  }, [resetToTitle]);

  const leavePond = useCallback(() => {
    track({ type: 'session_end' });
    endVisit();
    void audio.current.suspend();
    if (document.fullscreenElement) {
      void document.exitFullscreen?.().catch(() => undefined);
    }
    resetToTitle();
  }, [resetToTitle]);

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current !== null) {
        window.clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  // Audio lifecycle (06_MOBILE_WEB_CONSTRAINTS): suspend the AudioContext when
  // the tab is backgrounded (battery; iOS audio-session courtesy) and resume on
  // return; tear the whole context down on unmount so the looping ambient
  // source doesn't outlive the /game route.
  useEffect(() => {
    const instance = audio.current;
    const onVisibilityChange = () => {
      if (document.hidden) {
        void instance.suspend();
      } else if (startedRef.current) {
        void instance.resume();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      instance.dispose();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const preventTouch = (event: TouchEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-testid="tap-to-begin"], [data-testid="result-card"], [data-testid="gear-select"], [data-testid="prefs-strip"], .wall-overlay, .found-card, .bag-overlay, .tour-card')) {
        return;
      }

      event.preventDefault();
    };
    const preventGesture = (event: Event) => {
      event.preventDefault();
    };
    const updateOrientation = () => {
      const nextViewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      setViewport(nextViewport);
      setLandscape(nextViewport.width / nextViewport.height > TUNING.ui.landscapeMinAspect);
    };

    root.addEventListener('touchstart', preventTouch, { passive: false });
    document.addEventListener('gesturestart', preventGesture);
    updateOrientation();
    window.addEventListener('resize', updateOrientation);

    return () => {
      root.removeEventListener('touchstart', preventTouch);
      document.removeEventListener('gesturestart', preventGesture);
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

  const begin = useCallback(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;
    void audio.current.unlock()
      .then(() => {
        audio.current.beginConfirm();
      })
      .catch(() => undefined);
    void document.documentElement.requestFullscreen?.().catch(() => undefined);
    const orientation = screen.orientation as (ScreenOrientation & { lock?: (orientation: 'portrait') => Promise<void> }) | undefined;
    void orientation?.lock?.('portrait').catch(() => undefined);
    vibrate(TUNING.haptics.tapBegin);
    // The visit outlives a reload or a new tab (wall.ts touchVisit).
    visitIdRef.current = touchVisit(sessionStore.startSession(seed).id);
    track({ type: 'session_start' });
    if (runtime.current.ghost) runtime.current.ghost.fadeFrom = performance.now();
    runtime.current.state = { kind: 'scouting', sinceMs: performance.now() };
    setGameState(runtime.current.state);
    setStarted(true);
    arriveAtWater(waterRef.current);
    stampGear();
    if (!arrival) showArrivalTitle(waterRef.current);
    // arriveAtWater and stampGear read refs and stable setters only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, sessionStore, setGameState]);

  const finishResult = useCallback((outcome: 'catch' | FailureKind, peakTension: number, nearSnaps: number, hookedAt: number) => {
    if (runtime.current.state.kind === 'result') {
      return;
    }

    // Two clocks, deliberately: Date.now() is the wall-clock persistence
    // timestamp (journal `at`); performance.now() is the monotonic simulation
    // clock (durations, state timing) immune to NTP/clock adjustments mid-fight.
    const simNow = performance.now();
    let storyText = failureStory(outcome);
    let resultCatch: ResultCatch | undefined;
    audio.current.stopLoops();

    if (outcome === 'catch') {
      const catchEntry: Catch = {
        id: createId(),
        at: Date.now(),
        species: runtime.current.fish.instance.species,
        // A legend is always its full size; everything else is the fight's.
        sizeScore: isLegend(runtime.current.fish.instance.species)
          ? TUNING.fish.catchMaxSizeScore
          : clamp(peakTension, TUNING.fish.catchMinSizeScore, TUNING.fish.catchMaxSizeScore),
        // The lure this fish was actually caught on (22_THE_GEAR) — a flat journal
        // attribute, never a coverage/completion grid (14_DO_NOT_BUILD).
        lure: runtime.current.lureId,
        durationMs: Math.max(0, Math.round(simNow - hookedAt)),
        peakTension,
        nearSnaps,
        storyText: '',
        water: runtime.current.water,
        seed,
        spawnIndex: runtime.current.spawnIndex,
        hook: runtime.current.hookPos ?? { ...runtime.current.fish.position },
        phase: runtime.current.lightPhase
      };
      catchEntry.storyText = generateStory(catchEntry);
      storyText = catchEntry.storyText;
      // Personal-best check happens BEFORE recordCatch appends this catch to
      // the journal, so the comparison is against history only.
      const personalBest = personalBestFor(catchEntry);
      resultCatch = {
        species: catchEntry.species,
        sizeScore: catchEntry.sizeScore,
        lure: catchEntry.lure,
        durationMs: catchEntry.durationMs,
        nearSnaps: catchEntry.nearSnaps,
        peakTension: catchEntry.peakTension,
        personalBest,
        catchId: catchEntry.id,
        phase: runtime.current.lightPhase,
        hook: runtime.current.hookPos ?? { ...runtime.current.fish.position },
        seed,
        spawnIndex: runtime.current.spawnIndex,
        water: runtime.current.water
      };
      sessionStore.recordCatch(catchEntry);
      track({ type: 'catch', catch: catchEntry });
      audio.current.catchChime();
      vibrate(personalBest ? TUNING.haptics.personalBest : TUNING.haptics.catch);
    } else {
      const failure: Failure = {
        at: Date.now(),
        kind: outcome,
        context: {
          fishSpecies: runtime.current.fish.instance.species,
          peakTension
        }
      };
      sessionStore.recordFailure(failure);
      track({ type: 'failure', failure });
    }

    runtime.current.state = { kind: 'result', outcome, storyText, shownAt: simNow, peakTension, catch: resultCatch };
    runtime.current.reeling = false;
    runtime.current.reelPulseUntil = 0;
    runtime.current.tension = 0;
    runtime.current.lateHookUntil = 0;
    setReeling(false);
    setTension(0);
    setGameState(runtime.current.state);
  }, [seed, sessionStore, setGameState, setReeling, setTension]);

  const resetCast = useCallback(() => {
    spawnIndexRef.current += 1;
    const nextRuntime = createRuntime(seed, spawnIndexRef.current, waterRef.current);
    nextRuntime.state = { kind: 'scouting', sinceMs: performance.now() };
    runtime.current = nextRuntime;
    stampGear();
    setOverlay({ linePoints: [], rodTip: { x: 0, y: 0 }, lure: { x: 0, y: 0 }, aimTarget: null });
    setRipples([]);
    setRodOffset({ x: 0, z: 0 });
    setReeling(false);
    setGameState(nextRuntime.state);
    setFishState(nextRuntime.fish.state);
  }, [seed, setFishState, setGameState, setReeling, stampGear]);

  // A5.1: the water's name and its light fade in on arrival, then the pond
  // is clear. The light is read a moment later, once the scene has set it.
  const arrivalTitleKey = useRef(0);
  function showArrivalTitle(to: WaterId) {
    window.setTimeout(() => {
      arrivalTitleKey.current += 1;
      setArrivalTitle({ key: arrivalTitleKey.current, name: WATERS[to].name, light: lightWord(runtime.current.lightPhase) });
      window.setTimeout(() => setArrivalTitle(null), TUNING.walk.titleMs);
    }, 250);
  }

  // A5: arriving at a water counts a visit to it (the legend contract counts
  // visits, never the clock) and decides whether its legend is here.
  function arriveAtWater(to: WaterId) {
    const next = updateShore((current) => arriveAt(current, to));
    const count = next.visits[to] ?? 1;
    legendRef.current = WATERS[to].legendLights.length > 0
      ? createLegendState(forceLegend || legendThisVisit(count), performance.now(), seededRandom(`${seed}-legend-${to}-${count}`))
      : null;
    // Review only (?legend=1): the first surfacing comes quickly.
    if (forceLegend && legendRef.current) legendRef.current.nextSurfaceAt = performance.now() + 15_000;
    runtime.current.legend = legendRef.current;
  }

  // A5 the walk (docs/alpha/A5_RUBRIC.md §1): along the bank to the other
  // water. The camera walks out of this one toward the path, the next water
  // is grown, and the camera walks in from the other side. No menu, no map.
  const walkTo = useCallback(() => {
    if (walkingRef.current || runtime.current.state.kind !== 'scouting') return;
    const from = waterRef.current;
    const to: WaterId = from === 'home' ? 'lily' : 'home';
    const dir: -1 | 1 = from === 'home' ? -1 : 1;
    const half = TUNING.walk.durationMs * 0.5;
    walkingRef.current = true;
    setWalking(true);
    runtime.current.walk = { phase: 'out', startAt: performance.now(), dir };
    vibrate(TUNING.haptics.tapBegin);
    window.setTimeout(() => {
      waterRef.current = to;
      spawnIndexRef.current = 0;
      const next = createRuntime(seed, 0, to);
      next.state = { kind: 'scouting', sinceMs: performance.now() };
      next.walk = { phase: 'in', startAt: performance.now(), dir };
      runtime.current = next;
      arriveAtWater(to);
      stampGear();
      if (loadShore().seenCards.includes(to) || to === 'home') showArrivalTitle(to);
      setRipples([]);
      setOverlay({ linePoints: [], rodTip: { x: 0, y: 0 }, lure: { x: 0, y: 0 }, aimTarget: null });
      setWater(to);
      setGameState(next.state);
      setFishState(next.fish.state);
      // The first arrival shows the water's painting, once.
      if (!loadShore().seenCards.includes(to) && to !== 'home') {
        updateShore((current) => ({ ...current, seenCards: [...current.seenCards, to] }));
        setWaterCard(to);
        window.setTimeout(() => setWaterCard(null), TUNING.walk.cardMs);
      }
      window.setTimeout(() => {
        walkingRef.current = false;
        setWalking(false);
      }, half);
    }, half);
    // arriveAtWater and updateShore close over refs/stable setters only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, setFishState, setGameState, stampGear, updateShore]);

  // The found lure on its stone: tap to tie it on, tap again to take it off.
  const toggleSinker = useCallback(() => {
    const tied = !sinkerTiedRef.current;
    sinkerTiedRef.current = tied;
    updateShore((current) => ({ ...current, sinkerTied: tied }));
    stampGear();
    vibrate(TUNING.haptics.nibbleTick);
    showPondNote(tied ? 'Tied on the old sinking lure.' : 'Took the old sinking lure off.');
    // showPondNote is declared below and stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stampGear, updateShore]);

  // A snagged lure (it landed on a pad): one tap pulls it free with a splash
  // that spooks the fish nearby. Nothing is lost.
  const freeSnag = useCallback(() => {
    const current = runtime.current;
    if (!current.snagged) return;
    current.snagged = false;
    const at = { ...current.lurePos };
    spookFromSplash(current, at, TUNING.pads.freeSpookM / Math.max(0.1, TUNING.habits.splashSpookRadiusM), current.lightPhase, performance.now());
    addRipple(at, TUNING.lure.rippleRadiusOnImpactM, false);
    audio.current.fishSplash(TUNING.audio.impactSplashIntensity * 0.7);
    current.lureVisible = false;
    current.state = { kind: 'scouting', sinceMs: performance.now() };
    setGameState(current.state);
  }, [setGameState]);

  const closeFound = useCallback(() => {
    const current = runtime.current;
    if (current.state.kind !== 'found') return;
    if (current.state.what === 'sinker') {
      updateShore((value) => ({ ...value, foundSinker: true }));
    }
    current.lureVisible = false;
    current.state = { kind: 'scouting', sinceMs: performance.now() };
    setGameState(current.state);
  }, [setGameState, updateShore]);

  const showPondNote = useCallback((text: string) => {
    setPondNote(text);
    if (pondNoteTimer.current !== null) window.clearTimeout(pondNoteTimer.current);
    pondNoteTimer.current = window.setTimeout(() => setPondNote(null), TUNING.wall.swapNoteMs);
  }, []);

  // A4 keep or release (docs/alpha/A4_RUBRIC.md). Both go straight back to
  // fishing. One keeper per visit: a second Keep swaps the first off the wall.
  const keeperFromResult = useCallback((result: ResultCatch): Keeper | null => {
    if (!result.catchId || !(SPECIES_IDS as string[]).includes(result.species)) return null;
    return {
      catchId: result.catchId,
      visitId: visitIdRef.current || 'no-visit',
      at: Date.now(),
      species: result.species as SpeciesId,
      sizeScore: result.sizeScore,
      lure: result.lure,
      phase: result.phase ?? 0.25,
      water: result.water ?? 'home',
      legend: isLegend(result.species) || undefined
    };
  }, []);
  // Writes the wall and returns what went back; the card then confirms it
  // ("On the wall ✓") and the player chooses Keep fishing or See the wall.
  const keepCatch = useCallback((): { replacedName: string | null } => {
    const result = runtime.current.state.kind === 'result' ? runtime.current.state.catch : undefined;
    const keeper = result ? keeperFromResult(result) : null;
    if (!keeper) return { replacedName: null };
    if (visitIdRef.current) touchVisit(visitIdRef.current);
    const { wall, replaced } = keepFish(loadWall(), keeper);
    saveWall(wall);
    setWallHighlight(keeper.catchId);
    vibrate(TUNING.haptics.catch);
    return { replacedName: replaced ? SPECIES_STORY_LABELS[replaced.species] : null };
  }, [keeperFromResult]);
  const keptThenWall = useCallback(() => {
    resetCast();
    setWallOpen(true);
  }, [resetCast]);
  const releaseCatch = useCallback(() => {
    const result = runtime.current.state.kind === 'result' ? runtime.current.state.catch : undefined;
    const keeper = result ? keeperFromResult(result) : null;
    if (keeper) saveWall(releaseFish(loadWall(), keeper));
    const at = result?.hook ?? runtime.current.fish.position;
    resetCast();
    // It swims off: a ring where it went back in.
    addRipple(at, TUNING.wall.releaseRippleM, false);
    showPondNote('Let go.');
  }, [keeperFromResult, resetCast, showPondNote]);
  // The fish already kept this visit: a Keep then asks before swapping.
  const currentKeeper = useMemo(() => {
    if (gameState.kind !== 'result' || gameState.outcome !== 'catch' || !visitIdRef.current) return null;
    const current = keeperOfVisit(loadWall(), visitIdRef.current);
    if (!current || current.catchId === gameState.catch?.catchId) return null;
    return { name: SPECIES_STORY_LABELS[current.species], weight: formatWeight(weightGrams(current.species, current.sizeScore)) };
  }, [gameState]);
  const wallData = useMemo(() => (wallOpen ? wallLines(loadWall()) : []), [wallOpen]);

  useEffect(() => {
    if (gameState.kind !== 'result') {
      setResultDismissReady(false);
      return undefined;
    }

    setResultDismissReady(false);
    const timeout = window.setTimeout(() => {
      setResultDismissReady(true);
    }, TUNING.timing.resultDismissLockMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [gameState]);

  const clearFocusHold = useCallback(() => {
    if (focusTimeoutRef.current !== null) {
      window.clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }
  }, []);

  const armFocusHold = useCallback((pointerId: number, x: number, y: number) => {
    clearFocusHold();

    if (runtime.current.focusCooldownUntil > performance.now()) {
      return;
    }

    focusTimeoutRef.current = window.setTimeout(() => {
      const pointer = pointerRef.current;
      const state = runtime.current.state.kind;

      if (!pointer || pointer.id !== pointerId || pointer.mode !== 'pending_lure' || (state !== 'scouting' && state !== 'lure_idle')) {
        return;
      }

      const now = performance.now();
      runtime.current.focusUntil = now + TUNING.input.focusDurationMs;
      runtime.current.focusCooldownUntil = runtime.current.focusUntil + TUNING.input.focusCooldownMs;
      setFocusActive(true);
      setFocusIndicators((value) => [...value, { id: createId(), x, y, createdAt: now }]);
      track({ type: 'focus_used' });

      window.setTimeout(() => {
        if (runtime.current.focusUntil <= performance.now()) {
          setFocusActive(false);
        }
      }, TUNING.input.focusDurationMs);
    }, TUNING.input.focusHoldMs);
  }, [clearFocusHold]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!started || runtime.current.state.kind === 'splash') {
      return;
    }

    if (event.pointerType === 'touch' && event.isPrimary === false) {
      // A second finger toggles the readout, unless it was the start of a
      // three-finger tap (the QR, components/ui/QrTap): wait a moment and
      // check before toggling.
      window.setTimeout(() => {
        if (!document.querySelector('[data-testid="qr-tap"]')) setDebugOpen((value) => !value);
      }, 140);
      return;
    }

    // A5: nothing is cast mid-walk; a snagged lure is freed by any tap; and
    // while the lure is in, the shore's things can be tapped (the path, the
    // bench, the found lure on its stone).
    if (walkingRef.current) return;
    if (runtime.current.snagged && runtime.current.state.kind === 'lure_idle') {
      freeSnag();
      return;
    }
    if (runtime.current.state.kind === 'scouting') {
      const targets = runtime.current.targets;
      const near = (point: ScreenPoint | null) =>
        !!point && Math.hypot(event.clientX - point.x, event.clientY - point.y) <= TUNING.walk.tapRadiusPx;
      if (near(targets.path)) {
        walkTo();
        return;
      }
      if (near(targets.bench)) {
        if (!shore.seenBench) updateShore((current) => ({ ...current, seenBench: true }));
        runtime.current.state = { kind: 'found', what: 'bench', shownAt: performance.now() };
        setGameState(runtime.current.state);
        return;
      }
      if (near(targets.sinker)) {
        toggleSinker();
        return;
      }
    }

    pointerRef.current = {
      id: event.pointerId,
      mode: 'pending_lure',
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      downAt: performance.now(),
      startRodOffset: { ...runtime.current.rodOffset }
    };
    armFocusHold(event.pointerId, event.clientX, event.clientY);

    if (runtime.current.state.kind === 'hooked') {
      clearFocusHold();
      pointerRef.current.mode = 'reeling';
      reelTap();
      return;
    }

    if (runtime.current.state.kind === 'lure_idle' && runtime.current.lateHookUntil > performance.now()) {
      resolveMiss('missed_late');
      return;
    }

    if (runtime.current.state.kind === 'lure_idle' && viewport && isRodTouch(event.clientX, event.clientY, viewport)) {
      clearFocusHold();
      pointerRef.current.mode = 'rod_control';
      runtime.current.rodControlActive = true;
      runtime.current.state = {
        kind: 'rod_control',
        lurePos: runtime.current.lurePos,
        sinceMs: performance.now(),
        load: runtime.current.tension
      };
      setGameState(runtime.current.state);
      return;
    }

    if (runtime.current.state.kind === 'scouting') {
      pointerRef.current.mode = 'aiming';
      const cast = computeCast(event.clientX, event.clientY, event.clientX, event.clientY);
      runtime.current.state = {
        kind: 'aiming',
        startPx: { x: event.clientX, z: event.clientY },
        currentPx: { x: event.clientX, z: event.clientY },
        power: cast.power
      };
      runtime.current.aimTarget = cast.aimTarget;
      runtime.current.aimSpread = cast.spreadRadius;
      setGameState(runtime.current.state);
      setAimPreview({ power: cast.power, target: cast.target });
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current;

    if (!pointer || pointer.id !== event.pointerId) {
      return;
    }

    pointer.x = event.clientX;
    pointer.y = event.clientY;

    if (Math.hypot(pointer.x - pointer.startX, pointer.y - pointer.startY) >= TUNING.input.tapMoveTolerancePx) {
      clearFocusHold();
    }

    if (pointer.mode === 'rod_control') {
      runtime.current.rodTargetOffset = clampRodOffset({
        x: pointer.startRodOffset.x + (pointer.x - pointer.startX) / TUNING.ui.worldProjectScale,
        z: pointer.startRodOffset.z - (pointer.y - pointer.startY) / TUNING.input.rodControlScreenPixels
      });
      return;
    }

    if (pointer.mode === 'pending_lure') {
      const moved = Math.hypot(pointer.x - pointer.startX, pointer.y - pointer.startY);

      if (moved < TUNING.input.tapMoveTolerancePx) {
        return;
      }

      if (!canPendingTouchBecomeCast(runtime.current)) {
        return;
      }

      pointer.mode = 'aiming';
      const cast = computeCast(pointer.startX, pointer.startY, pointer.x, pointer.y);
      runtime.current.state = {
        kind: 'aiming',
        startPx: { x: pointer.startX, z: pointer.startY },
        currentPx: { x: pointer.x, z: pointer.y },
        power: cast.power
      };
      runtime.current.aimTarget = cast.aimTarget;
      runtime.current.aimSpread = cast.spreadRadius;
      setGameState(runtime.current.state);
      setAimPreview({ power: cast.power, target: cast.target });
      return;
    }

    if (pointer.mode !== 'aiming' || runtime.current.state.kind !== 'aiming') {
      return;
    }

    const cast = computeCast(pointer.startX, pointer.startY, pointer.x, pointer.y);
    runtime.current.state = {
      ...runtime.current.state,
      currentPx: { x: pointer.x, z: pointer.y },
      power: cast.power
    };
    runtime.current.aimTarget = cast.aimTarget;
    runtime.current.aimSpread = cast.spreadRadius;
    setGameState(runtime.current.state);
    setAimPreview({ power: cast.power, target: cast.target });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current;
    pointerRef.current = null;
    clearFocusHold();

    if (!started) {
      return;
    }

    // Tap-to-reel: releasing the finger does NOT stop the reel. Each tap fired one
    // discrete pulse on pointer-down; the pulse expires on its own in the frame loop
    // (reelPulseUntil), so lifting up just ends this tap's pointer and the player taps
    // again to keep the line coming.
    if (pointer?.mode === 'reeling' || runtime.current.state.kind === 'hooked') {
      return;
    }

    if (pointer?.mode === 'rod_control') {
      runtime.current.rodControlActive = false;
      runtime.current.rodTargetOffset = { x: 0, z: 0 };

      if (runtime.current.state.kind === 'rod_control') {
        runtime.current.state = { kind: 'lure_idle', lurePos: runtime.current.lurePos, sinceMs: performance.now(), lastTwitchAt: runtime.current.lastTwitchAt };
        setGameState(runtime.current.state);
      }
      return;
    }

    if (runtime.current.state.kind === 'bite_window') {
      runtime.current.fish.state = { kind: 'hooked', stamina: TUNING.fish.hookedInitialStamina, rage: runtime.current.rng() };
      runtime.current.hookPos = { ...runtime.current.fish.position };
      runtime.current.tension = TUNING.tension.hookedInitialTension;
      runtime.current.hookJerkUntil = performance.now() + TUNING.timing.hookJerkMs;
      runtime.current.lureMovedUntil = performance.now() + TUNING.timing.hookJerkMs;
      runtime.current.lureFlashUntil = performance.now() + TUNING.timing.hookJerkMs;
      runtime.current.nextSurgeAt = scheduleNextSurge(runtime.current, performance.now());
      runtime.current.state = {
        kind: 'hooked',
        hookedAt: performance.now(),
        stamina: TUNING.fish.hookedInitialStamina,
        slackMs: 0,
        nearSnaps: 0,
        peakTension: runtime.current.tension
      };
      track({ type: 'hook_attempt', result: 'success' });
      audio.current.hooksetThunk();
      addRipple(runtime.current.lurePos, TUNING.lure.rippleRadiusOnTwitchM, false);
      addRipple(runtime.current.fish.position, TUNING.lure.rippleRadiusOnImpactM, false);
      vibrate(TUNING.haptics.hookset);
      setGameState(runtime.current.state);
      setFishState(runtime.current.fish.state);
      return;
    }

    if (!pointer || pointer.mode === 'pending_lure' || runtime.current.state.kind !== 'aiming') {
      if (runtime.current.state.kind === 'lure_idle' || runtime.current.state.kind === 'rod_control') {
        twitchLure();
      } else if (runtime.current.lateHookUntil > performance.now()) {
        resolveMiss('missed_late');
      }
      return;
    }

    const moved = Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY);
    setAimPreview(null);
    runtime.current.aimTarget = null;

    if (moved < TUNING.input.tapMoveTolerancePx && runtime.current.state.kind === 'aiming') {
      if (runtime.current.lateHookUntil > performance.now()) {
        resolveMiss('missed_late');
        return;
      }

      if (isEarlyHookAttempt(runtime.current.fish.state.kind)) {
        resolveMiss('missed_early');
        return;
      }

      runtime.current.state = { kind: 'lure_idle', lurePos: runtime.current.lurePos, sinceMs: performance.now(), lastTwitchAt: runtime.current.lastTwitchAt };
      setGameState(runtime.current.state);
      twitchLure();
      return;
    }

    const cast = computeCast(pointer.startX, pointer.startY, event.clientX, event.clientY);
    const now = performance.now();
    runtime.current.state = {
      kind: 'casting',
      from: TUNING.world.rodTip,
      target: cast.target,
      startedAt: now,
      flightMs: cast.flightMs,
      power: cast.power
    };
    runtime.current.lureVisible = true;
    runtime.current.lurePos = TUNING.world.rodTip;
    runtime.current.lureVelocity = { x: 0, z: 0 };
    runtime.current.lureY = TUNING.world.lureSurfaceY;
    sessionStore.recordCast();
    track({ type: 'cast', rodId: runtime.current.rodId, lureId: runtime.current.lureId });
    audio.current.castWhoosh(cast.power);
    setGameState(runtime.current.state);
  };

  // Debug-only harness hook (?debug=1): start a REAL cast at a world point —
  // the same state a finger release sets — and read fish back. Lets headless
  // checks drive the landing path (promotion, the A3 spook rule, the still-lure
  // clock) without faking perspective-correct drags.
  useEffect(() => {
    if (!reviewHooks) return;
    const hook = {
      castAt(x: number, z: number) {
        const now = performance.now();
        runtime.current.state = { kind: 'casting', from: TUNING.world.rodTip, target: { x, z }, startedAt: now, flightMs: 500, power: 0.6 };
        runtime.current.lureVisible = true;
        runtime.current.lurePos = TUNING.world.rodTip;
        runtime.current.lureVelocity = { x: 0, z: 0 };
        runtime.current.lureY = TUNING.world.lureSurfaceY;
        setGameState(runtime.current.state);
      },
      // Land the current primary fish as a catch (A4 checks: keep/release,
      // the wall and the link without a real fight).
      forceCatch(tension = 0.6) {
        if (runtime.current.state.kind === 'result') return;
        runtime.current.hookPos = { ...runtime.current.fish.position };
        finishResultRef.current?.('catch', tension, 0, performance.now() - 4000);
      },
      wall() {
        return wallLines(loadWall());
      },
      // A5: where the shore's tappable things are on screen, the water, the
      // legend, and a way to tap a target exactly.
      shore() {
        const r = runtime.current;
        return {
          water: r.water,
          state: r.state.kind,
          snagged: r.snagged,
          lureId: r.lureId,
          targets: { path: r.targets.path && { ...r.targets.path }, bench: r.targets.bench && { ...r.targets.bench }, sinker: r.targets.sinker && { ...r.targets.sinker } },
          legend: r.legend ? { ...r.legend, pos: { ...r.legendPos } } : null,
          species: r.fish.instance.species,
          saved: loadShore()
        };
      },
      surfaceLegend() {
        if (runtime.current.legend) runtime.current.legend.nextSurfaceAt = 0;
      },
      fish() {
        const r = runtime.current;
        const now = performance.now();
        const all = [r.fish, ...r.decorFish.map((d) => d.snapshot)];
        return {
          state: r.state.kind,
          habits: r.habits,
          stillMs: lureStillMs(r, now),
          fish: all.map((f, i) => ({ primary: i === 0, x: f.position.x, z: f.position.z, kind: f.state.kind, species: f.instance.species, home: f.instance.home ?? null }))
        };
      }
    };
    (window as Window & { __watersDebug?: typeof hook }).__watersDebug = hook;
    return () => {
      delete (window as Window & { __watersDebug?: typeof hook }).__watersDebug;
    };
  }, [reviewHooks, setGameState]);
  const finishResultRef = useRef<typeof finishResult | null>(null);
  finishResultRef.current = finishResult;

  // The review tour's view of the game (TourOverlay): React state through a
  // ref so the tour's poll reads this render's values, and its scene setups
  // through the same paths a player's taps take.
  const tourView = useRef({ started, bagOpen, walking, shore, gear });
  tourView.current = { started, bagOpen, walking, shore, gear };
  const applyGearRef = useRef(applyGear);
  applyGearRef.current = applyGear;
  const tourApi = useMemo<TourApi>(() => ({
    probe() {
      const r = runtime.current;
      const v = tourView.current;
      return {
        started: v.started,
        water: r.water,
        state: r.state.kind,
        walking: v.walking,
        bagOpen: v.bagOpen,
        kept: loadWall().keepers.filter((k) => !k.released).map((k) => k.catchId).sort().join(','),
        foundSinker: v.shore.foundSinker || forceSinker,
        seenBench: v.shore.seenBench,
        snagged: r.snagged,
        lureId: r.lureId,
        rodId: r.rodId
      };
    },
    shorePoint(key) {
      const at = runtime.current.targets[key];
      return at ? { x: at.x, y: at.y } : null;
    },
    setup(step) {
      const r = runtime.current;
      const v = tourView.current;
      switch (step.kind) {
        case 'gear': {
          // Review convenience: an idle lure comes home so the next cast is
          // with the new gear. Never during a bite, a fight or a result.
          if (r.state.kind === 'lure_idle' && !r.snagged) {
            r.lureVisible = false;
            r.state = { kind: 'scouting', sinceMs: performance.now() };
            setGameState(r.state);
          }
          if (r.state.kind !== 'scouting' || v.walking) return false;
          if (!isRodId(step.rodId ?? v.gear.rodId) || !isLureId(step.lureId ?? v.gear.lureId)) return true;
          applyGearRef.current({ rodId: (step.rodId ?? v.gear.rodId) as GearSelection['rodId'], lureId: (step.lureId ?? v.gear.lureId) as GearSelection['lureId'] });
          return true;
        }
        case 'catch': {
          if (v.walking || v.bagOpen) return false;
          if (r.state.kind === 'result') return true;
          if (r.state.kind !== 'scouting' && r.state.kind !== 'lure_idle') return false;
          r.hookPos = { ...r.fish.position };
          finishResultRef.current?.('catch', 0.6, 0, performance.now() - 4000);
          return true;
        }
        case 'bag': {
          if (!step.open) {
            setBagOpen(false);
            return true;
          }
          if (r.state.kind !== 'scouting' || v.walking) return false;
          setBagOpen(true);
          if (step.scrollTo) {
            const target = step.scrollTo;
            window.setTimeout(() => document.querySelector(target)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 120);
          }
          return true;
        }
        case 'surface-legend': {
          if (!r.legend) return false;
          r.legend.nextSurfaceAt = 0;
          return true;
        }
      }
      return true;
    }
  }), [forceSinker, setGameState]);

  function reelTap() {
    if (runtime.current.state.kind !== 'hooked') {
      return;
    }

    const now = performance.now();
    // Debounce a single physical tap firing twice (pointer jitter): one finger tap is
    // one pulse. The cadence skill lives well above this floor.
    if (now - runtime.current.lastReelTapAt < TUNING.input.tapReelMinIntervalMs) {
      return;
    }
    runtime.current.lastReelTapAt = now;

    // Instant tension burst (the jolt of cranking the handle) plus a reel pulse window
    // during which updateFight keeps tension rising and updateHookedContactPoint pulls
    // the fish in. Tapping again before the pulse expires stacks bursts toward the snap
    // threshold; pausing lets tension bleed off (tensionTapDecayRate).
    runtime.current.tension = clamp(runtime.current.tension + TUNING.tension.tensionPerTap, 0, 1);
    runtime.current.reelPulseUntil = now + TUNING.input.tapReelPulseMs;
    runtime.current.reeling = true;
    setReeling(true);

    // Immediate chunk of line yanked in on the tap itself (clamped to the remaining
    // distance), so the fish visibly jerks rodward the instant you tap — the pulse
    // window then keeps it coming for tapReelPulseMs. Mirrors updateHookedContactPoint.
    const waterEntry = clampToFishableWater(rodTipForRuntime(runtime.current));
    const toRod = sub(waterEntry, runtime.current.fish.position);
    const distanceToRod = Math.hypot(toRod.x, toRod.z);
    if (distanceToRod > 0) {
      const pull = scale(normalize(toRod), Math.min(distanceToRod, TUNING.input.tapReelImpulse));
      runtime.current.fish = {
        ...runtime.current.fish,
        position: add(runtime.current.fish.position, pull)
      };
      runtime.current.lurePos = { x: runtime.current.fish.position.x, z: runtime.current.fish.position.z };
    }

    audio.current.reelTick();
    vibrate(TUNING.haptics.reelTap);
  }

  function twitchLure() {
    if (!runtime.current.lureVisible || (runtime.current.state.kind !== 'lure_idle' && runtime.current.state.kind !== 'rod_control')) {
      return;
    }

    if (runtime.current.lateHookUntil > performance.now()) {
      resolveMiss('missed_late');
      return;
    }

    const now = performance.now();
    // Lure gear (22_THE_GEAR): twitchMult scales the hop distance only (presentation
    // feel). Applied here at the hop sites, NOT to the rod-control deadband, which
    // shares lureTwitchDistanceM but is unrelated handling.
    const twitchMult = lureMods(runtime.current.lureId).twitchMult;
    runtime.current.lastTwitchAt = now;
    runtime.current.lureMovedUntil = now + TUNING.lure.lureTwitchDurationMs;
    runtime.current.lureFlashUntil = now + TUNING.lure.lureFlashDurationMs;
    runtime.current.lurePos = clampToFishableWater({
      x: runtime.current.lurePos.x + (runtime.current.rng() - TUNING.lure.lureTwitchSidewaysRatio) * TUNING.lure.lureTwitchDistanceM * twitchMult,
      z: runtime.current.lurePos.z + TUNING.lure.lureTwitchDistanceM * twitchMult
    });
    runtime.current.lureVelocity = { x: 0, z: 0 };
    runtime.current.state = { kind: 'lure_idle', lurePos: runtime.current.lurePos, sinceMs: now, lastTwitchAt: now };
    addRipple(runtime.current.lurePos, TUNING.lure.rippleRadiusOnTwitchM, false);
    audio.current.lureTwitch();
    setGameState(runtime.current.state);
  }

  function resolveMiss(kind: 'missed_early' | 'missed_late') {
    track({ type: 'hook_attempt', result: kind === 'missed_early' ? 'early' : 'late' });
    audio.current.fishSplash(TUNING.audio.missedSplashIntensity);
    vibrate(TUNING.haptics.missed);
    finishResult(kind, runtime.current.tension, 0, performance.now());
  }

  function addRipple(pos: Vec2, radius: number, falseCue: boolean, cue: FishCueKind = 'ripple') {
    setRipples((value) => [
      ...value,
      {
        id: createId(),
        pos,
        radius,
        createdAt: performance.now(),
        durationMs: falseCue ? TUNING.fish.cueRippleDurationMs : TUNING.fish.cueShadowDurationMs,
        falseCue,
        cue
      }
    ]);
  }

  const previewDots = useMemo(() => {
    if (!aimPreview || !overlay.aimTarget || overlay.rodTip.y <= 0) {
      return [];
    }

    const start = overlay.rodTip;
    const end = overlay.aimTarget;

    return Array.from({ length: TUNING.input.aimPreviewDots }, (_, index) => {
      const t = index / (TUNING.input.aimPreviewDots - 1);
      return {
        id: index,
        x: lerp(start.x, end.x, t),
        y: lerp(start.y, end.y, t) - Math.sin(Math.PI * t) * TUNING.input.aimPreviewPowerPx * aimPreview.power,
        scale: lerp(TUNING.input.aimPreviewDotMinScale, TUNING.input.aimPreviewDotMaxScale, t)
      };
    });
  }, [aimPreview, overlay.aimTarget, overlay.rodTip]);

  // The equipped rod's line strength scales the snap thresholds (22_THE_GEAR): the
  // short rod snaps easier, so the "near snap" warning visuals must fire at its
  // lower effective threshold too — not the raw constant — or the red warning lies.
  // updateFight() applies the same scalar to the snap LOGIC. Default rod = 1.0.
  const effNearSnapThreshold = TUNING.tension.nearSnapThreshold * rodMods(gear.rodId).lineStrengthMult;
  const lineColor = tension > effNearSnapThreshold
    ? TUNING.line.lineSnapColour
    : tension >= TUNING.tension.tensionSweetSpotMin
      ? TUNING.line.lineTautColour
      : TUNING.line.lineSlackColour;
  const hookImpulse = gameState.kind === 'hooked'
    ? Math.max(0, 1 - (performance.now() - gameState.hookedAt) / TUNING.timing.hookJerkMs)
    : 0;
  const lineWidth = (tension > effNearSnapThreshold
    ? TUNING.line.lineSnapWidthPx
    : tension >= TUNING.tension.tensionSweetSpotMin
      ? TUNING.line.lineTautWidthPx
      : TUNING.line.lineSlackWidthPx) + hookImpulse * TUNING.line.lineHookWidthBoostPx;

  const showLine = gameState.kind === 'casting'
    || gameState.kind === 'lure_idle'
    || gameState.kind === 'rod_control'
    || gameState.kind === 'bite_window'
    || gameState.kind === 'hooked';

  const rodButtScreen = useMemo<ScreenPoint | null>(() => {
    if (!viewport) {
      return null;
    }

    return {
      x: viewport.width * TUNING.world.rodScreenButtXRatio,
      y: viewport.height * (1 - TUNING.world.rodScreenButtBottomRatio)
    };
  }, [viewport]);

  const biteHaloPos = gameState.kind === 'bite_window' ? overlay.lure : null;
  // Tap-to-reel HUD: while hooked, prompt "Tap to reel" until the line nears the snap
  // line, then flip to "Ease off" (stop tapping, let tension bleed). The prompt is NOT
  // gated on the per-tap `reeling` pulse (that flickers every tap) — it shows whenever
  // it's safe to keep cranking, so the instruction reads steady.
  const cuePrompt: { kind: 'tap' | 'reel' | 'ease'; text: string } | null =
    gameState.kind === 'bite_window'
      ? { kind: 'tap', text: 'Tap!' }
      : gameState.kind === 'hooked' && tension > TUNING.ui.reelHintTensionWarn
        ? { kind: 'ease', text: 'Ease off' }
        : gameState.kind === 'hooked'
          ? { kind: 'reel', text: 'Tap to reel' }
          : null;
  const showTensionBar = gameState.kind === 'hooked' || gameState.kind === 'rod_control';

  // Fight drama: a red vignette breathes in from the screen edges as tension
  // closes on the snap line — the danger should be felt at the edges of vision
  // before the player ever reads the bar. Scaled to the EFFECTIVE threshold so
  // the short rod's earlier snap point also warns earlier.
  const dangerStart = effNearSnapThreshold * TUNING.ui.dangerVignetteStartRatio;
  const dangerOpacity = gameState.kind === 'hooked'
    ? clamp((tension - dangerStart) / Math.max(0.001, 1 - dangerStart), 0, 1)
    : 0;

  return (
    <main
      ref={rootRef}
      className="game-root"
      data-testid="game-route"
      data-game-state={gameState.kind}
      data-fish-state={fishState.kind}
      data-started={started ? 'true' : 'false'}
      data-arrival={arrival ? 'true' : 'false'}
      data-tour={tour ? tour.id : undefined}
      data-webgl-handlers={glHandlersReady ? 'ready' : 'pending'}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <Canvas
        className="game-canvas"
        dpr={pixelRatio}
        gl={{ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
        camera={{ position: TUNING.world.cameraPosition, fov: TUNING.world.cameraFov }}
      >
        <Suspense fallback={null}>
          <GameScene
            key={water}
            water={water}
            foundSinker={foundSinker}
            sinkerTied={shore.sinkerTied && foundSinker}
            started={started}
            runtime={runtime}
            audio={audio}
            setOverlay={setOverlay}
            setRipples={setRipples}
            ripples={ripples}
            setRodOffset={setRodOffset}
            setPixelRatio={setPixelRatio}
            onResult={finishResult}
            onRestoringChange={setRestoring}
            onFocusActiveChange={setFocusActive}
            arrivalPhase={arrival?.phase}
          />
        </Suspense>
      </Canvas>

      {viewport && rodButtScreen && started && overlay.rodTip.y > 0 ? (
        <svg className="line-overlay" aria-hidden="true">
          {showLine && overlay.linePoints.length > 1 ? (
            <polyline
              points={overlay.linePoints.map((point) => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke={lineColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={lineWidth}
            />
          ) : null}
          <defs>
            <linearGradient id="rod-gradient" gradientUnits="userSpaceOnUse"
              x1={rodButtScreen.x} y1={rodButtScreen.y} x2={overlay.rodTip.x} y2={overlay.rodTip.y}>
              <stop offset="0%" stopColor="#2a1a10" />
              <stop offset="35%" stopColor="#5a3e28" />
              <stop offset="78%" stopColor="#8a6a48" />
              <stop offset="100%" stopColor="#c2a878" />
            </linearGradient>
          </defs>
          <path
            d={rodPathFromScreen(rodButtScreen, overlay.rodTip, hookImpulse)}
            fill="none"
            stroke="url(#rod-gradient)"
            strokeLinecap="round"
            strokeWidth={TUNING.world.rodScreenStrokeWidthPx}
          />
          <RodReel rodButtScreen={rodButtScreen} rodTipScreen={overlay.rodTip} />
        </svg>
      ) : null}

      {aimPreview && overlay.aimTarget && (overlay.aimRingRx ?? 0) > 1.5 ? (
        <span
          className="aim-spread-ring"
          aria-hidden="true"
          style={{
            transform: `translate(${overlay.aimTarget.x}px, ${overlay.aimTarget.y}px) translate(-50%, -50%)`,
            width: `${(overlay.aimRingRx ?? 0) * 2}px`,
            height: `${(overlay.aimRingRy ?? 0) * 2}px`
          }}
        />
      ) : null}

      {aimPreview && overlay.aimTarget ? (
        // The lure you are about to throw, at the aim point: the choice is in
        // your hand while you aim, not only in the strip (GEAR_REVISIT §4.3).
        <span
          className="aim-lure"
          aria-hidden="true"
          data-testid="aim-lure"
          data-lure={runtime.current.lureId}
          style={{ transform: `translate(${overlay.aimTarget.x}px, ${overlay.aimTarget.y}px) translate(-50%, -50%)` }}
        >
          {lureGlyph(runtime.current.lureId)}
        </span>
      ) : null}

      {previewDots.map((dot) => (
        <span
          key={dot.id}
          className="preview-dot"
          style={{ transform: `translate(${dot.x}px, ${dot.y}px) scale(${dot.scale})` }}
        />
      ))}

      {biteHaloPos ? (
        <span
          className="bite-halo"
          style={{ transform: `translate(${biteHaloPos.x}px, ${biteHaloPos.y}px)` }}
        >
          <span className="bite-halo-ring" />
        </span>
      ) : null}

      {focusActive ? <div className="focus-vignette" aria-hidden="true" /> : null}

      {focusIndicators.map((indicator) => {
        const age = performance.now() - indicator.createdAt;
        const opacity = Math.max(0, 1 - age / TUNING.input.focusCooldownMs);

        if (opacity <= 0) {
          return null;
        }

        return (
          <span
            key={indicator.id}
            className="focus-ring"
            style={{
              opacity,
              transform: `translate(${indicator.x}px, ${indicator.y}px) translate(-50%, -50%) scale(${1 + (1 - opacity) * 1.8})`
            }}
          />
        );
      })}

      {cuePrompt ? (
        // role=status/aria-live: the prompt is the game's only textual
        // instruction stream ("Tap!", "Ease off") — announce it to screen
        // readers instead of leaving the canvas game silent.
        <div className={`cue-prompt ${cuePrompt.kind}`} data-testid="cue-prompt" role="status" aria-live="polite">
          {cuePrompt.text}
        </div>
      ) : null}

      {coachHint && !bagOpen && gameState.kind !== 'found' ? (
        <div className="coach-hint" role="status">
          {coachHint}
        </div>
      ) : null}

      {dangerOpacity > 0.02 ? (
        <div className="danger-vignette" aria-hidden="true" style={{ opacity: dangerOpacity }} />
      ) : null}

      {showTensionBar ? (
        <div className="tension-bar" aria-hidden="true">
          <div
            className="tension-bar-mark danger"
            style={{ bottom: `${effNearSnapThreshold * 100}%` }}
          />
          <div
            className="tension-bar-mark"
            style={{ bottom: `${TUNING.tension.tensionSafeHold * 100}%` }}
          />
          <div
            className={`tension-bar-fill${
              tension > effNearSnapThreshold ? ' danger' : tension >= TUNING.tension.tensionSweetSpotMin ? ' sweet' : ''
            }`}
            style={{ height: `${Math.min(1, Math.max(0, tension)) * 100}%` }}
          />
        </div>
      ) : null}

      {started && gameState.kind === 'scouting' ? (
        <GearSelect gear={shore.sinkerTied && foundSinker ? { ...gear, lureId: 'old_sinker' } : gear} onSelect={applyGear} explainerOpen={gearHelpOpen} onExplainerOpenChange={setGearHelpOpen} />
      ) : null}

      {started && gameState.kind === 'scouting' && !walking && !bagOpen ? (
        // A5.1: one glyph, top right: the tackle bag (wall, logbook, trophies,
        // found, bring someone, settings, about). The pond stays the
        // interface; everything that is yours is one tap away.
        <div className="prefs-strip" data-testid="prefs-strip">
          <button
            type="button"
            className="gear-glyph prefs-glyph bag-glyph"
            aria-label="Your tackle bag"
            data-testid="open-bag"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setBagOpen(true)}
          >
            {bagGlyph()}
          </button>
        </div>
      ) : null}

      {bagOpen ? (
        <TackleBag
          water={water}
          where={`${WATERS[water].name} · ${lightWord(runtime.current.lightPhase)}`}
          seed={seed}
          foundSinker={foundSinker}
          seenBench={shore.seenBench}
          prefs={prefs}
          onTogglePref={togglePref}
          onOpenWall={() => {
            setBagOpen(false);
            setWallOpen(true);
          }}
          onOpenBench={() => {
            setBagOpen(false);
            runtime.current.state = { kind: 'found', what: 'bench', shownAt: performance.now() };
            setGameState(runtime.current.state);
          }}
          onLeave={() => {
            setBagOpen(false);
            leavePond();
          }}
          onClose={() => setBagOpen(false)}
        />
      ) : null}

      {arrivalTitle ? (
        <div className="arrival-title" aria-hidden="true" data-testid="arrival-title" key={arrivalTitle.key}>
          <span className="arrival-title-name">{arrivalTitle.name}</span>
          <span className="arrival-title-light">{arrivalTitle.light}</span>
        </div>
      ) : null}

      {started ? null : arrival ? (
        // A4: a catch link skips both title screens. The pond is already drawn
        // behind this card; one tap is still needed to unlock sound.
        <div
          className="arrival-screen"
          data-testid="tap-to-begin"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
        >
          <div className="arrival-card" data-testid="arrival-card">
            <span className="arrival-kicker">The Waters · a fishing game</span>
            <p className="arrival-line">{arrivalLine(arrival)}</p>
            <p className="arrival-sub">
              It&apos;s the same pond with the same fish. The gold ring on the water marks where it bit. Can you catch one too?
            </p>
            <button type="button" className="arrival-go" data-testid="arrival-go" onClick={begin}>
              Start fishing
            </button>
            <span className="arrival-credit">
              Made by{' '}
              <a href={AUTHOR.url} target="_blank" rel="noreferrer">{AUTHOR.name}</a>
              {' · A Birb Labs artefact'}
            </span>
          </div>
        </div>
      ) : (
        // The title IS the start (25 Oct 2026, docs/alpha/ATTRIBUTION.md): one
        // tap and you are at the water (the tap still unlocks sound). The old
        // full-screen credit card is gone; the credit lives on this screen,
        // on every share, and in the tackle bag's About. A div, not a
        // <button>, because the credit line holds links.
        <div
          className="splash-title-screen"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onPointerUp={(event) => {
            event.stopPropagation();
          }}
          onClick={begin}
          data-testid="tap-to-begin"
        >
          <div className="splash-title-card" role="img" aria-label="The Waters">
            <span className="splash-title-name">The Waters</span>
            <span className="splash-title-tag">six waters, one shore</span>
          </div>
          {/* One link, to the owner's home page (owner, 26 Oct 2026: not /links). */}
          <a
            className="splash-credit-line"
            data-testid="credit-line"
            href={AUTHOR.url}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            Made by <span className="splash-credit-name">{AUTHOR.name}</span> · A Birb Labs artefact
          </a>
          <button type="button" className="splash-hint" aria-label="Go to the water" onClick={(event) => { event.stopPropagation(); begin(); }}>
            Tap to fish
          </button>
          <span className="splash-qr-note" data-testid="qr-note">Three fingers anywhere: a QR to share</span>
        </div>
      )}

      {gameState.kind === 'result' ? (
        <CatchResultCard
          outcome={gameState.outcome}
          result={gameState.catch ?? null}
          storyText={gameState.storyText}
          dismissReady={resultDismissReady}
          onCastAgain={resetCast}
          onKeep={keepCatch}
          onRelease={releaseCatch}
          currentKeeper={currentKeeper}
          onOpenWall={keptThenWall}
          journalLink={{ label: 'The wall →', href: '/wall' }}
        />
      ) : null}

      {gameState.kind === 'found' ? (
        <div
          className="found-card"
          data-testid="found-card"
          role="dialog"
          aria-label={gameState.what === 'bench' ? 'The bench' : 'Something that is not a fish'}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
        >
          {gameState.what === 'bench' ? (
            <>
              <div
                className="bench-plank"
                data-testid="bench-plank"
                style={ART_DELIVERED.benchWood ? {
                  // A pale wash over the painted grain, so the cut reads.
                  backgroundImage: "linear-gradient(180deg, rgba(232, 226, 212, 0.18), rgba(232, 226, 212, 0.32) 50%, rgba(232, 226, 212, 0.18)), url('/assets/textures/bench-wood.webp')",
                  backgroundSize: 'cover'
                } : undefined}
              >
                <p className="bench-carving">
                  OLD MOSSBACK. 90 LB. FIRST LIGHT.
                  <br />
                  IT CAME UP FOR THE ONE ON THE BOTTOM.
                  <br />
                  <span className="bench-initials">— R.T. &apos;86</span>
                </p>
              </div>
              <p className="found-sub">Someone carved it into the bench a long time ago.</p>
            </>
          ) : (
            <>
              <div
                className="found-sinker"
                aria-hidden="true"
                style={ART_DELIVERED.oldSinker ? { background: "url('/assets/sprites/old_sinker.webp') center / contain no-repeat" } : undefined}
              />
              <p className="found-title">Not a fish.</p>
              <p className="found-sub">An old sinking lure, tangled in line under the bank.</p>
            </>
          )}
          <button type="button" className="result-keep" data-testid="found-close" onClick={closeFound}>
            {gameState.what === 'bench' ? 'Back to the water' : 'Keep it'}
          </button>
        </div>
      ) : null}

      {waterCard ? (
        <div className="water-card" data-testid="water-card" aria-label={WATERS[waterCard].name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={WATER_CARD_ART[waterCard]} alt="" />
          <span className="water-card-name">{WATERS[waterCard].name}</span>
        </div>
      ) : null}

      {walking ? <div className="walk-veil" aria-hidden="true" /> : null}

      {pondNote && gameState.kind !== 'result' ? (
        <div className="pond-note" role="status" data-testid="pond-note">{pondNote}</div>
      ) : null}

      {wallOpen ? (
        <div
          className="wall-overlay"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
        >
          <WallBoard lines={wallData} highlight={wallHighlight} onClose={() => setWallOpen(false)} />
        </div>
      ) : null}

      {queryXray && started ? (
        // Owner-only review lens legend (?xray=1, linked from /ab after picking).
        <div className="xray-legend" aria-hidden="true">
          <strong>X-ray</strong>
          <span><i style={{ background: XRAY_COLORS.idle }} />idle</span>
          <span><i style={{ background: XRAY_COLORS.feeding }} />feeding</span>
          <span><i style={{ background: XRAY_COLORS.curious }} />after the lure</span>
          <span><i style={{ background: XRAY_COLORS.waiting }} />waiting for a still lure</span>
          <span><i style={{ background: XRAY_COLORS.spooked }} />spooked</span>
          <span><i className="xray-ring" />home</span>
        </div>
      ) : null}

      {restoring ? <div className="restore-overlay">Restoring...</div> : null}
      {landscape ? <div className="restore-overlay">Rotate back to portrait</div> : null}

      {debugOpen ? (
        <DebugHud
          metrics={debugMetrics}
          gameState={gameState.kind}
          fishState={fishState.kind}
          lureState={lureState}
          tension={tension}
          seed={seed}
        />
      ) : null}
      {tour ? <TourOverlay tour={tour} api={tourApi} /> : null}
    </main>
  );

  function computeCast(startX: number, startY: number, endX: number, endY: number) {
    const drag = {
      x: (endX - startX) / TUNING.input.dragPowerPixels,
      z: (endY - startY) / TUNING.input.dragPowerPixels
    };
    const dragLength = Math.hypot(drag.x, drag.z);
    const power = clamp(dragLength, TUNING.input.castPowerMin, TUNING.input.castPowerMax);
    const rawDirection = normalize(drag);
    const direction = {
      x: rawDirection.x,
      z: Math.min(rawDirection.z, 0)
    };
    // Rod gear (22_THE_GEAR): rangeMult scales how far a full cast throws (the short
    // rod literally can't reach the far dark); accuracyMult scales the landing
    // spread below. reachT deliberately stays on the GLOBAL castMaxRangeM so spread
    // reads as f(physical reach) — a short rod confined to near water is tight, and
    // accuracyMult tightens it further; it does NOT make the short rod scatter more
    // per metre. Both scatter and the aim reticle read the one spreadRadius below.
    const rod = rodMods(gearRef.current.rodId);
    const effMaxRange = TUNING.input.castMaxRangeM * rod.rangeMult;
    const target = clampToPond(
      {
        x: TUNING.world.rodTip.x + direction.x * power * effMaxRange,
        z: TUNING.world.rodTip.z + direction.z * power * effMaxRange
      },
      TUNING.world.pondWidthM,
      TUNING.world.pondHeightM,
      TUNING.world.pondMarginRatio
    );
    const visibleTarget = {
      x: clamp(target.x, -TUNING.input.castVisibleHalfWidthM, TUNING.input.castVisibleHalfWidthM),
      z: Math.min(target.z, TUNING.world.rodTip.z - TUNING.input.castMinForwardM)
    };

    // Accuracy falloff (19_THE_FAR_WATER): scatter the landing point by a radius
    // that grows with how far the cast reaches. Deterministic per gesture (hashed
    // from the release point) so the same drag always lands the same — testable,
    // and not a slot machine. sqrt() keeps the scatter uniform across the disc.
    const reach = Math.hypot(visibleTarget.x - TUNING.world.rodTip.x, visibleTarget.z - TUNING.world.rodTip.z);
    const reachT = clamp(reach / TUNING.input.castMaxRangeM, 0, 1);
    const spreadRadius = lerp(
      TUNING.input.castSpreadNearM,
      TUNING.input.castSpreadFarM,
      Math.pow(reachT, TUNING.input.castSpreadCurve)
    ) * rod.accuracyMult;
    const hash = (n: number) => {
      const s = Math.sin(n) * 43758.5453;
      return s - Math.floor(s);
    };
    const spreadAngle = hash(endX * 12.9898 + endY * 78.233) * Math.PI * 2;
    const spreadDist = Math.sqrt(hash(endX * 39.346 + endY * 11.135)) * spreadRadius;
    const scattered = {
      x: visibleTarget.x + Math.cos(spreadAngle) * spreadDist,
      z: visibleTarget.z + Math.sin(spreadAngle) * spreadDist
    };

    return {
      target: clampToFishableWater(scattered),
      aimTarget: clampToFishableWater(visibleTarget),
      spreadRadius,
      power,
      flightMs: lerp(TUNING.input.castFlightTimeMin, TUNING.input.castFlightTimeMax, power) * TUNING.timing.msPerSecond
    };
  }
}


// The painting shown the first time you arrive at a water (public/art/PROMPTS.md).
const WATER_CARD_ART: Record<WaterId, string> = {
  home: '/art/waters/01-garden-pond.webp',
  lily: '/art/waters/02-lily-pond.webp'
};

// The tackle bag: a satchel with its flap and strap.
function bagGlyph() {
  return (
    <svg viewBox="0 0 28 28" width="24" height="24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 10c0-3 2-5 5-5s5 2 5 5" opacity="0.6" />
        <rect x="5" y="10" width="18" height="13" rx="3" />
        <path d="M5 14.5h18" />
        <path d="M13 14.5v2.6h2v-2.6" />
      </g>
    </svg>
  );
}




function isRodTouch(screenX: number, screenY: number, viewport: ViewportSize): boolean {
  const buttX = viewport.width * TUNING.world.rodScreenButtXRatio;
  const buttY = viewport.height * (1 - TUNING.world.rodScreenButtBottomRatio);
  const tipX = viewport.width * TUNING.ui.worldProjectOffsetXRatio
    + TUNING.world.rodTip.x * TUNING.ui.worldProjectScale;
  const tipY = viewport.height * TUNING.ui.worldProjectOffsetYRatio
    - TUNING.world.rodTip.z * TUNING.ui.worldProjectScale;

  return distancePointToSegment(
    { x: screenX, z: screenY },
    { x: buttX, z: buttY },
    { x: tipX, z: tipY }
  ) <= TUNING.input.rodTouchRadiusPx;
}
