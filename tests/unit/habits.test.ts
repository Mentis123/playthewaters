import assert from 'node:assert/strict';
import { test } from 'node:test';

import { updateFish, type FishSnapshot, type FishUpdateInput } from '../../src/game/fish/fishStateMachine';
import {
  feedingAmount,
  homeFor,
  homeOf,
  splashSpooks,
  spookTarget,
  stillNeededMs,
  stillRingAmount,
  type HomeId
} from '../../src/game/fish/habits';
import type { SpeciesId } from '../../src/game/fish/species';
import { phaseOf } from '../../src/game/light/pondLight';
import { distance, seededRandom, type Vec2 } from '../../src/game/math/vec';
import { TUNING } from '../../src/game/tuning/tuning';

const DT = 1 / 60;

function fishAt(species: SpeciesId, home: HomeId | undefined, position: Vec2, personality = 0): FishSnapshot {
  return {
    position,
    velocity: { x: 0, z: 0 },
    state: { kind: 'wander', targetPos: position, sinceMs: 0 },
    instance: { species, personality, home }
  };
}

type Step = Partial<Omit<FishUpdateInput, 'nowMs' | 'dt' | 'rng'>>;

function simulate(fish: FishSnapshot, seconds: number, input: Step, seed = 'habits', onStep?: (f: FishSnapshot, nowMs: number) => void) {
  const rng = seededRandom(seed);
  let nowMs = 0;
  for (let i = 0; i < Math.round(seconds / DT); i += 1) {
    nowMs += DT * 1000;
    fish = updateFish({ nowMs, dt: DT, lurePos: null, lureMoved: false, hooked: false, rng, lureAttractMult: 1, lureFearMult: 1, ...input }, fish);
    onStep?.(fish, nowMs);
  }
  return fish;
}

test('feeding lights: each species feeds at its own light and not at the opposite one', () => {
  assert.equal(feedingAmount('old_kingfish', phaseOf('night')), 1);
  assert.equal(feedingAmount('old_kingfish', phaseOf('day')), 0);
  assert.equal(feedingAmount('bronze_carp', phaseOf('day')), 1);
  assert.equal(feedingAmount('bronze_carp', phaseOf('night')), 0);
  assert.equal(feedingAmount('moon_minnow', phaseOf('dusk')), 1);
  assert.equal(feedingAmount('moon_minnow', phaseOf('night')), 1);
  assert.equal(feedingAmount('reed_pike', phaseOf('dawn')), 0);
  // Smooth, not a switch: halfway into the window is partial.
  const partial = feedingAmount('reed_pike', phaseOf('dusk') + TUNING.habits.feedingHalfWidth / 2);
  assert.ok(partial > 0.2 && partial < 0.8, `partial ${partial}`);
});

test('homes: every species gets a home from its own preference list', () => {
  const rng = seededRandom('homes');
  for (const species of Object.keys(TUNING.habits.speciesHomes) as SpeciesId[]) {
    for (let i = 0; i < 20; i += 1) {
      assert.ok((TUNING.habits.speciesHomes[species] as readonly string[]).includes(homeFor(species, rng)));
    }
  }
});

test('off its light a fish stays at home; on its light it roams wider and comes nearer the bank', () => {
  const home = homeOf('deep');
  let offMax = 0;
  let onMax = 0;
  let offZ = 0;
  let onZ = 0;
  let n = 0;
  simulate(fishAt('old_kingfish', 'deep', { x: home.x, z: home.z }), 180, { habit: { feeding: 0, stillMs: 0 } }, 'off', (f) => {
    offMax = Math.max(offMax, distance(f.position, home));
    offZ += f.position.z;
    n += 1;
  });
  simulate(fishAt('old_kingfish', 'deep', { x: home.x, z: home.z }), 180, { habit: { feeding: 1, stillMs: 0 } }, 'on', (f) => {
    onMax = Math.max(onMax, distance(f.position, home));
    onZ += f.position.z;
  });
  assert.ok(offMax < home.radius + 0.6, `off-feed strayed ${offMax.toFixed(2)} m from a ${home.radius} m home`);
  assert.ok(onMax > offMax + 0.8, `feeding roam ${onMax.toFixed(2)} vs off ${offMax.toFixed(2)}`);
  assert.ok(onZ / n > offZ / n + 0.8, 'a feeding deep fish comes up toward the near water');
});

test('the spook rule: a splash on top of a fish spooks it; a splash near it does not', () => {
  const fish = { x: 0, z: -1 };
  assert.equal(splashSpooks(fish, { x: 0.2, z: -1 }, 1, 1, 0), true);
  assert.equal(splashSpooks(fish, { x: 1.2, z: -1 }, 1, 1, 0), false);
  assert.ok(1.2 < TUNING.fish.fishNoticeRadius, 'the near-miss splash is still inside notice range');
  const target = spookTarget(fish, seededRandom('spook'));
  assert.ok(target.z <= TUNING.world.fishableMinZ + TUNING.habits.spookFarBandM + 1e-9, 'spooked fish head for the far dark');
});

test('a spooked fish ignores a lure in front of it until its hold runs out', () => {
  const spooked: FishSnapshot = {
    ...fishAt('moss_bass', 'reeds_left', { x: 0, z: -4.8 }),
    state: { kind: 'flee', targetPos: { x: 0, z: -5 }, sinceMs: 0, holdMs: 20000 }
  };
  let noticedAt = -1;
  simulate(spooked, 30, { lurePos: { x: 0.3, z: -4.6 }, habit: { feeding: 0.5, stillMs: 0 } }, 'hold', (f, nowMs) => {
    if (noticedAt < 0 && f.state.kind === 'notice') noticedAt = nowMs;
  });
  assert.ok(noticedAt < 0 || noticedAt >= 20000, `noticed the lure at ${noticedAt} ms, inside a 20 s hold`);
});

test('the still lure: the old kingfish only commits once the lure has been still long enough', () => {
  const start = { x: 0, z: -4 };
  const lure = { x: 0.6, z: -4 };
  const reached = (stillMs: number) => {
    const kinds = new Set<string>();
    simulate(fishAt('old_kingfish', 'deep', start), 30, { lurePos: lure, habit: { feeding: 0, stillMs } }, 'still', (f) => kinds.add(f.state.kind));
    return kinds;
  };
  const jittery = reached(0);
  assert.ok(jittery.has('inspect'), 'it comes to look');
  assert.ok(!jittery.has('commit') && !jittery.has('bite'), 'but never commits to a lure that is not still');
  const still = reached(stillNeededMs('old_kingfish', 0) + 100);
  assert.ok(still.has('commit') || still.has('bite'), 'a still lure gets the take');
});

test('species with no still requirement commit as before', () => {
  const kinds = new Set<string>();
  simulate(fishAt('moss_bass', 'reeds_left', { x: 0, z: -1 }), 20, { lurePos: { x: 0.6, z: -1 }, habit: { feeding: 0, stillMs: 0 } }, 'bass', (f) => kinds.add(f.state.kind));
  assert.ok(kinds.has('commit') || kinds.has('bite'));
});

test('without habits a fish behaves exactly as before (baselines stay honest)', () => {
  const a = simulate(fishAt('bronze_carp', undefined, { x: 1, z: -2 }), 60, {}, 'same');
  const b = simulate(fishAt('bronze_carp', 'stones', { x: 1, z: -2 }), 60, {}, 'same');
  assert.deepEqual(a, { ...b, instance: { ...b.instance, home: undefined } });
});

test('the stillness ring closes with stillness and is fully open at zero', () => {
  assert.equal(stillRingAmount(0), 0);
  assert.equal(stillRingAmount(TUNING.habits.stillRingFullMs), 1);
  assert.equal(stillRingAmount(TUNING.habits.stillRingFullMs * 3), 1);
});

test('A3.1: a spook is a bolt: much faster than an ordinary flee for its first second', async () => {
  const bolt: FishSnapshot = { ...fishAt('moss_bass', 'stones', { x: 0, z: 0 }), state: { kind: 'flee', targetPos: { x: 0, z: -5 }, sinceMs: 0, holdMs: 20000 } };
  const stroll: FishSnapshot = { ...fishAt('moss_bass', 'stones', { x: 0, z: 0 }), state: { kind: 'flee', targetPos: { x: 0, z: -5 }, sinceMs: 0 } };
  const a = simulate(bolt, 1, { habit: { feeding: 0, stillMs: 0 } }, 'bolt');
  const b = simulate(stroll, 1, { habit: { feeding: 0, stillMs: 0 } }, 'bolt');
  assert.ok(Math.abs(a.position.z) > Math.abs(b.position.z) * 2, `bolt ${a.position.z.toFixed(2)} vs stroll ${b.position.z.toFixed(2)}`);
});

test('A3.1: fish close to a spooked fish scatter with it; far ones do not', async () => {
  const { splashScatter } = await import('../../src/game/fish/habits');
  const positions = [{ x: 0, z: 0 }, { x: 1, z: 0.2 }, { x: 3.5, z: 0 }];
  const hit = splashScatter(positions, { x: 0.1, z: 0 }, [0.75, 0.75, 0.75], [true, true, true]);
  assert.deepEqual(hit.map((h) => h.index).sort(), [0, 1]);
  assert.equal(hit.find((h) => h.index === 0)!.holdMul, 1);
  assert.ok(hit.find((h) => h.index === 1)!.holdMul < 1);
  assert.deepEqual(splashScatter(positions, { x: 2, z: 2 }, [0.75, 0.75, 0.75], [true, true, true]), []);
  // A fish that cannot spook (hooked, biting) is never swept up, even right beside the splash.
  assert.deepEqual(splashScatter(positions, { x: 0.9, z: 0.2 }, [0.75, 0.75, 0.75], [false, true, true]).map((h) => h.index), [1]);
});

test('A3.1: busy (feeding) water ripples at least five times as often as idle water', async () => {
  const { habitCueIntervalMultiplier } = await import('../../src/game/fish/habits');
  assert.ok(habitCueIntervalMultiplier(0) / habitCueIntervalMultiplier(1) >= 5);
});
