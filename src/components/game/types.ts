import type { ProceduralAudio } from '@/game/audio/procedural';
import type { FishSnapshot } from '@/game/fish/fishStateMachine';
import type { FishCueKind, SpeciesId } from '@/game/fish/species';
import type { LureId, RodId } from '@/game/gear/gear';
import type { Vec2 } from '@/game/math/vec';
import type { VerletLine } from '@/game/physics/verletLine';
import type { FailureKind, GameState } from '@/game/state/gameStateMachine';

export type PointerSnapshot = {
  id: number;
  mode: 'aiming' | 'pending_lure' | 'rod_control' | 'reeling';
  startX: number;
  startY: number;
  x: number;
  y: number;
  downAt: number;
  startRodOffset: Vec2;
};

export type DecorFish = {
  snapshot: FishSnapshot;
  fadePhase: number;
  fadePeriodMs: number;
  nextCueAt: number;
  cueIndex: number;
};

export type Runtime = {
  state: GameState;
  fish: FishSnapshot;
  // Equipped gear ids (22_THE_GEAR), stamped onto the runtime so the per-frame
  // fight/lure/fish code resolves the same loadout the player chose pre-cast.
  rodId: RodId;
  lureId: LureId;
  fishFadePhase: number;
  fishFadePeriodMs: number;
  decorFish: DecorFish[];
  rng: () => number;
  lurePos: Vec2;
  lureVelocity: Vec2;
  lureY: number;
  lureVisible: boolean;
  lureMovedUntil: number;
  lureFlashUntil: number;
  // A3 habits (23_ALPHA_CANON §4): on for the current chapter's look only, so
  // `?look=a2` and earlier stay exact baselines. lureLandedAt starts the
  // still-lure clock; homeRng assigns homes from its own stream.
  habits: boolean;
  lureLandedAt: number;
  homeRng: () => number;
  // A3.1: bolting fish leave a V-wake for a moment (index -1 = primary).
  spookTrails: Array<{ index: number; until: number; nextAt: number }>;
  lastNudgeAt: number;
  // A4: the light's phase, written by the scene every frame (a catch link
  // carries it); where the fish was hooked; and the arrival silhouette a link
  // visitor sees where the sender's fish was hooked (fadeFrom = when it began
  // to fade, null while it holds).
  lightPhase: number;
  // A5: which water this runtime is (species, homes, pads read from WATERS).
  water: import('@/game/waters/waters').WaterId;
  // A5: screen positions of the tappable shore things (written by the scene
  // every frame from the live camera; null when absent), the legend this
  // visit (shared across respawns), where it is, and the camera walk.
  targets: { path: ScreenPoint | null; bench: ScreenPoint | null; sinker: ScreenPoint | null };
  legend: import('@/game/waters/legend').LegendState | null;
  legendPos: Vec2;
  walk: { phase: 'out' | 'in'; startAt: number; dir: -1 | 1 } | null;
  // The cast landed on a lily pad: the lure sits on it until tapped free.
  snagged: boolean;
  hookPos: Vec2 | null;
  ghost: { species: SpeciesId; pos: Vec2; fadeFrom: number | null } | null;
  line: VerletLine;
  tension: number;
  rodOffset: Vec2;
  rodTargetOffset: Vec2;
  rodControlActive: boolean;
  // Tap-to-reel: `reeling` is now a transient per-tap PULSE, not a held flag. A tap
  // sets reelPulseUntil = now + tapReelPulseMs; the frame loop derives
  // `reeling = now < reelPulseUntil` so the existing reel pull / tension rise / reel
  // audio all run for the brief pulse window, then stop until the next tap.
  reeling: boolean;
  reelPulseUntil: number;
  lastReelTapAt: number;
  lastBiteAt: number;
  lastTwitchAt: number | null;
  focusUntil: number;
  focusCooldownUntil: number;
  lateHookUntil: number;
  hookJerkUntil: number;
  nextRealCueAt: number;
  nextFalseCueAt: number;
  nextStruggleRippleAt: number;
  nextSurgeAt: number;
  // Set by updateFight when a fish surges; GameScene nudges the camera until
  // this deadline for a physical jolt to match the audio/haptic spike.
  surgeShakeUntil: number;
  lastRippleSweepAt: number;
  spawnIndex: number;
  realCueIndex: number;
  restoring: boolean;
  // True while the rod/lure explainer is open — freezes the pond sim so the
  // water holds still while reading (set from the overlay, read in GameScene).
  pondFrozen: boolean;
  minFps: number;
  fpsSamples: Array<{ at: number; fps: number }>;
  lowFpsSince: number;
  highFpsSince: number;
  degradationLevel: number;
  pixelRatio: number;
  aimTarget: Vec2 | null;
  aimSpread: number;
};

export type Ripple = {
  id: string;
  pos: Vec2;
  radius: number;
  createdAt: number;
  durationMs: number;
  falseCue: boolean;
  cue: FishCueKind;
};

export type AimPreview = {
  power: number;
  target: Vec2;
};

export type FocusIndicator = {
  id: string;
  x: number;
  y: number;
  createdAt: number;
};

export type SplashStage = 'primary' | 'secondary';

export type ViewportSize = {
  width: number;
  height: number;
};

export type ScreenPoint = {
  x: number;
  y: number;
};

export type Overlay = {
  linePoints: ScreenPoint[];
  rodTip: ScreenPoint;
  lure: ScreenPoint;
  aimTarget: ScreenPoint | null;
  // Screen-space radii of the landing-zone reticle. rx != ry because the world
  // circle on the water plane projects to a foreshortened ellipse under the
  // over-the-water camera — flatter the farther you aim (19_THE_FAR_WATER).
  aimRingRx?: number;
  aimRingRy?: number;
};

export type SceneProps = {
  started: boolean;
  runtime: React.MutableRefObject<Runtime>;
  audio: React.MutableRefObject<ProceduralAudio>;
  setOverlay: React.Dispatch<React.SetStateAction<Overlay>>;
  setRipples: React.Dispatch<React.SetStateAction<Ripple[]>>;
  ripples: Ripple[];
  setRodOffset: (offset: Vec2) => void;
  setPixelRatio: (pixelRatio: number) => void;
  onResult: (outcome: 'catch' | FailureKind, peakTension: number, nearSnaps: number, hookedAt: number) => void;
  onRestoringChange: (restoring: boolean) => void;
  onFocusActiveChange: (active: boolean) => void;
  // A4: a link visitor starts at the sender's light (still drifting).
  arrivalPhase?: number;
  // A5: which water is drawn, and the old sinking lure (found / tied on).
  water?: import('@/game/waters/waters').WaterId;
  foundSinker?: boolean;
  sinkerTied?: boolean;
};
