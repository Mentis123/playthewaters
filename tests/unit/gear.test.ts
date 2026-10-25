import assert from 'node:assert/strict';
import { test } from 'node:test';

import { LURE_IDS, STRIP_LURE_IDS, isLureId, migrateLureId } from '../../src/game/gear/gear';
import { decodeCatchLink } from '../../src/game/share/catchLink';
import { migrateWall } from '../../src/game/wall/wall';
import { TUNING } from '../../src/game/tuning/tuning';

// docs/alpha/GEAR_REVISIT.md: the quiet lure (was "sinker") no longer sinks,
// the only sinking lure is the found one, and the short rod's whole price is
// reach.

test('the strip is natural, popper, quiet; the found lure is outside it', () => {
  assert.deepEqual([...STRIP_LURE_IDS], ['natural', 'popper', 'quiet']);
  assert.ok(LURE_IDS.includes('old_sinker'));
  assert.ok(!(STRIP_LURE_IDS as string[]).includes('old_sinker'));
});

test('only the found lure sinks faster than the natural', () => {
  for (const id of LURE_IDS) {
    const sinks = TUNING.gear.lures[id].sinkMult > 1;
    assert.equal(sinks, id === 'old_sinker', `${id} sinkMult ${TUNING.gear.lures[id].sinkMult}`);
  }
});

test('the old "sinker" id is carried forward everywhere it was saved', () => {
  assert.equal(migrateLureId('sinker'), 'quiet');
  assert.equal(migrateLureId('popper'), 'popper');
  assert.ok(isLureId(migrateLureId('sinker')));
  // An A4 catch link made with the sinker still opens.
  const wire = { v: 1, s: 'old-link', i: 0, p: 500, f: 'bronze_carp', z: 500, x: 0, y: -200, l: 'sinker' };
  const code = btoa(JSON.stringify(wire)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  assert.equal(decodeCatchLink(code)?.lure, 'quiet');
  // A wall row kept on the sinker reads as the quiet lure.
  const wall = migrateWall({ schemaVersion: 1, keepers: [{ catchId: 'a', visitId: 'v', at: 1, species: 'bronze_carp', sizeScore: 0.5, lure: 'sinker', phase: 0.25, water: 'home' }] });
  assert.equal(wall.keepers[0].lure, 'quiet');
});

test('the short rod reaches the edge of the dark and never into the deep; its line is not weaker', () => {
  const reachZ = TUNING.world.rodTip.z - TUNING.input.castMaxRangeM * TUNING.gear.rods.short.rangeMult;
  assert.ok(reachZ <= TUNING.world.revealNoneZ, `short rod reaches the reveal edge (${reachZ.toFixed(2)})`);
  assert.ok(reachZ > -4.5 + 0.3, `short rod stops short of the deep home (${reachZ.toFixed(2)})`);
  assert.equal(TUNING.gear.rods.short.lineStrengthMult, 1);
});
