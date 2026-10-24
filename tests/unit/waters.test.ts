import assert from 'node:assert/strict';
import { test } from 'node:test';

import { legendSpookedBy, legendTakes, legendThisVisit, type LegendState } from '../../src/game/waters/legend';
import { isWaterId, nextVisitCount, padCoverAt, WATERS } from '../../src/game/waters/waters';
import { TUNING } from '../../src/game/tuning/tuning';

const present: LegendState = { present: true, spooked: false, nextSurfaceAt: 0, surfacingUntil: 0 };

test('the legend is present on odd visits from the third, never before', () => {
  const seen = [1, 2, 3, 4, 5, 6, 7, 8].map(legendThisVisit);
  assert.deepEqual(seen, [false, false, true, false, true, false, true, false]);
});

test('the legend takes only the old sinking lure, dead still, close, at its light', () => {
  const ok = { lureId: 'old_sinker', stillMs: TUNING.legend.stillMs, distance: 0.5, atLight: true, state: present };
  assert.equal(legendTakes(ok), true);
  assert.equal(legendTakes({ ...ok, lureId: 'sinker' }), false, 'the strip sinker is not it');
  assert.equal(legendTakes({ ...ok, stillMs: TUNING.legend.stillMs - 1 }), false, 'a lure that moved');
  assert.equal(legendTakes({ ...ok, distance: TUNING.legend.takeRadiusM + 0.01 }), false);
  assert.equal(legendTakes({ ...ok, atLight: false }), false);
  assert.equal(legendTakes({ ...ok, state: { ...present, spooked: true } }), false);
  assert.equal(legendTakes({ ...ok, state: { ...present, present: false } }), false);
});

test('a careless cast close to it blows the visit', () => {
  assert.equal(legendSpookedBy(1.0, present, true), true);
  assert.equal(legendSpookedBy(TUNING.legend.spookRadiusM + 0.1, present, true), false);
  assert.equal(legendSpookedBy(0.2, { ...present, spooked: true }, true), false);
});

test('pads cover the water they sit on and nothing else', () => {
  const lily = WATERS.lily;
  const island = lily.pads[0];
  assert.ok(padCoverAt(lily, island.x, island.z, 0) >= 0);
  assert.equal(padCoverAt(lily, 0, -1.2, 0), -1, 'open water');
  assert.equal(padCoverAt(WATERS.home, 0, 0, 0), -1, 'the home pond has no pads');
  // Drift moves the island but never further than its drift.
  for (let t = 0; t < 200; t += 7) assert.ok(padCoverAt(lily, island.x, island.z, t) >= 0);
});

test('waters and visit counts', () => {
  assert.equal(isWaterId('lily'), true);
  assert.equal(isWaterId('moat'), false);
  const counts = nextVisitCount(nextVisitCount({}, 'lily'), 'lily');
  assert.equal(counts.lily, 2);
  assert.equal(counts.home, undefined);
  // The lily pond has no kingfish (photo 04).
  assert.equal(WATERS.lily.species.old_kingfish, undefined);
});
