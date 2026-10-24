import { TUNING } from '@/game/tuning/tuning';

export type SpeciesId = keyof typeof TUNING.fish.species;

export type FishCueKind =
  | 'bubble_trail'
  | 'glint'
  | 'surface_rise'
  | 'tail_flash'
  | 'silt_plume'
  | 'wake'
  | 'ripple';

export type FishInstance = {
  species: SpeciesId;
  personality: number;
  // A3 habits: the home feature this fish returns to. Assigned only when
  // habits are on, from a separate seeded stream so baselines stay identical.
  home?: import('@/game/fish/habits').HomeId;
};

export type SpeciesTuning = typeof TUNING.fish.species[SpeciesId];

export const SPECIES_IDS = Object.keys(TUNING.fish.species) as SpeciesId[];

// Legends (23_ALPHA_CANON §4) never spawn by weight: spawnWeight 0, placed only
// when their conditions are met.
export const LEGEND_SPECIES: readonly SpeciesId[] = ['old_mossback'];
export function isLegend(species: string): boolean {
  return (LEGEND_SPECIES as readonly string[]).includes(species);
}

export const SPECIES_CUE_SIGNATURES: Record<SpeciesId, FishCueKind[]> = {
  bronze_carp: ['bubble_trail', 'ripple'],
  moss_bass: ['glint', 'ripple'],
  moon_minnow: ['surface_rise', 'tail_flash'],
  old_kingfish: ['silt_plume', 'ripple'],
  old_mossback: ['silt_plume', 'bubble_trail'],
  reed_pike: ['wake', 'ripple']
};

export const SPECIES_STORY_LABELS: Record<SpeciesId, string> = {
  bronze_carp: 'Bronze Carp',
  moss_bass: 'Moss Bass',
  moon_minnow: 'Moon Minnow',
  old_kingfish: 'Old Kingfish',
  old_mossback: 'Old Mossback',
  reed_pike: 'Reed Pike'
};

export function createFishInstance(rng: () => number, weights?: Partial<Record<SpeciesId, number>>): FishInstance {
  return {
    species: weights ? pickSpeciesFrom(rng, weights) : pickSpecies(rng),
    personality: rng() * 2 - 1
  };
}

export function createFishInstanceOfSpecies(rng: () => number, species: SpeciesId): FishInstance {
  return {
    species,
    personality: rng() * 2 - 1
  };
}

export function speciesTuning(species: SpeciesId): SpeciesTuning {
  return TUNING.fish.species[species];
}

export function personalityMultiplier(personality: number): number {
  return 1 + personality * TUNING.fish.personalityModulation;
}

export function pickSpeciesCue(species: SpeciesId, cueIndex: number): FishCueKind {
  const cues = SPECIES_CUE_SIGNATURES[species];
  return cues[cueIndex % cues.length];
}

// Identity-free cue kinds — pure movement on the surface (a wake, a ripple) with
// no species tell. Used for a fish still out in the dark (21_THE_REVEAL): you see
// that something moved, not what it is.
export const GENERIC_CUE_KINDS: FishCueKind[] = ['wake', 'ripple'];

export function cueForReveal(
  species: SpeciesId,
  cueIndex: number,
  reveal: number,
  speciesThreshold: number
): FishCueKind {
  if (reveal < speciesThreshold) {
    return GENERIC_CUE_KINDS[cueIndex % GENERIC_CUE_KINDS.length];
  }
  return pickSpeciesCue(species, cueIndex);
}

// Computed once at module load — the weights are static tuning data.
const TOTAL_SPAWN_WEIGHT = SPECIES_IDS.reduce((sum, species) => sum + speciesTuning(species).spawnWeight, 0);

// A5: a water's own species table (same single draw as pickSpecies).
export function pickSpeciesFrom(rng: () => number, weights: Partial<Record<SpeciesId, number>>): SpeciesId {
  const entries = SPECIES_IDS.filter((id) => (weights[id] ?? 0) > 0);
  if (entries.length === 0) return pickSpecies(rng);
  const total = entries.reduce((sum, id) => sum + (weights[id] as number), 0);
  let roll = rng() * total;
  for (const id of entries) {
    roll -= weights[id] as number;
    if (roll <= 0) return id;
  }
  return entries[entries.length - 1];
}

function pickSpecies(rng: () => number): SpeciesId {
  let roll = rng() * TOTAL_SPAWN_WEIGHT;

  for (const species of SPECIES_IDS) {
    roll -= speciesTuning(species).spawnWeight;

    if (roll <= 0) {
      return species;
    }
  }

  // Floating-point residue can leave roll marginally above zero after the last
  // deduction; the roll belongs to the final species, not a hardcoded fallback
  // that would silently bias the distribution.
  return SPECIES_IDS[SPECIES_IDS.length - 1];
}
