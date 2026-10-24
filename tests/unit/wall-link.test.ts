import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  arrivalLine,
  catchLinkPath,
  decodeCatchLink,
  encodeCatchLink,
  type CatchLink
} from '../../src/game/share/catchLink';
import {
  emptyWall,
  formatWeight,
  keepFish,
  keeperOfVisit,
  migrateWall,
  releaseFish,
  wallLines,
  weightGrams,
  type Keeper
} from '../../src/game/wall/wall';
import { TUNING } from '../../src/game/tuning/tuning';

const LINK: CatchLink = {
  seed: '2026-10-24-pond',
  spawnIndex: 3,
  phase: 0.512,
  species: 'bronze_carp',
  sizeScore: 0.734,
  hook: { x: -1.27, z: -3.4 },
  lure: 'popper',
  kept: true
};

test('a catch link round-trips every field', () => {
  const back = decodeCatchLink(encodeCatchLink(LINK));
  assert.deepEqual(back, LINK);
  const path = catchLinkPath(LINK);
  assert.ok(path.startsWith('/c/'));
  assert.ok(path.length < 200, `link is short enough to DM (${path.length})`);
});

test('kept is optional and survives as undefined', () => {
  const back = decodeCatchLink(encodeCatchLink({ ...LINK, kept: undefined }));
  assert.equal(back?.kept, undefined);
  assert.equal(decodeCatchLink(encodeCatchLink({ ...LINK, kept: false }))?.kept, false);
});

test('a bad, truncated or hostile code is not a link, and never throws', () => {
  const good = encodeCatchLink(LINK);
  const forge = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const wire = JSON.parse(atob(good.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (good.length % 4)) % 4)));
  const cases: Array<string | null | undefined> = [
    null,
    undefined,
    '',
    good.slice(0, good.length - 7),
    'not base64 !!',
    'x'.repeat(TUNING.link.maxCodeChars + 1),
    forge([1, 2, 3]),
    forge('a string'),
    forge({ ...wire, v: 2 }),
    forge({ ...wire, s: '../../etc' }),
    forge({ ...wire, i: 1e12 }),
    forge({ ...wire, i: 2.5 }),
    forge({ ...wire, p: 1000 }),
    forge({ ...wire, f: 'shark' }),
    forge({ ...wire, z: -1 }),
    forge({ ...wire, x: 99999 }),
    forge({ ...wire, l: 'dynamite' }),
    forge({ ...wire, k: 2 }),
    forge({ ...wire, i: '3' })
  ];
  for (const code of cases) {
    assert.equal(decodeCatchLink(code), null, `rejected: ${String(code).slice(0, 40)}`);
  }
});

test('the arrival line says what and where, never how', () => {
  const line = arrivalLine(LINK);
  assert.match(line, /Bronze Carp/);
  assert.match(line, /at dusk/);
  assert.match(line, /kept/);
  assert.doesNotMatch(line, /popper|lure/i, 'the lure is the how');
});

function keeper(catchId: string, visitId: string, sizeScore: number, species: Keeper['species'] = 'bronze_carp'): Keeper {
  return { catchId, visitId, at: 1, species, sizeScore, lure: 'natural', phase: 0.25, water: 'home' };
}

test('one keeper per visit: a second keep swaps the first off the wall', () => {
  let wall = emptyWall();
  let result = keepFish(wall, keeper('a', 'v1', 0.3));
  assert.equal(result.replaced, null);
  wall = result.wall;
  result = keepFish(wall, keeper('b', 'v1', 0.2, 'reed_pike'));
  assert.equal(result.replaced?.catchId, 'a');
  wall = result.wall;
  assert.deepEqual(wall.keepers.map((k) => k.catchId), ['b']);
  assert.equal(keeperOfVisit(wall, 'v1')?.catchId, 'b');
  // A new visit keeps its own.
  wall = keepFish(wall, keeper('c', 'v2', 0.9)).wall;
  assert.deepEqual(wall.keepers.map((k) => k.catchId).sort(), ['b', 'c']);
  // Keeping the same catch twice adds nothing.
  assert.equal(keepFish(wall, keeper('c', 'v2', 0.9)).wall, wall);
});

test('letting go undoes a keep of the same fish, and otherwise writes nothing', () => {
  let wall = keepFish(emptyWall(), keeper('a', 'v1', 0.3)).wall;
  wall = releaseFish(wall, keeper('a', 'v1', 0.3));
  assert.equal(wall.keepers.length, 0);
  wall = releaseFish(wall, keeper('z', 'v1', 0.3));
  assert.equal(wall.keepers.length, 0);
  // A released legend is written, in its own colour (A5+).
  wall = releaseFish(wall, { ...keeper('L', 'v1', 0.5), legend: true });
  assert.equal(wall.keepers[0].released, true);
  assert.equal(wallLines(wall).length, 0, 'released legends are not drawn as keeper lines yet');
});

test('the wall shows the heaviest kept fish of each species, heaviest first', () => {
  let wall = emptyWall();
  wall = keepFish(wall, keeper('small-carp', 'v1', 0.1)).wall;
  wall = keepFish(wall, keeper('big-carp', 'v2', 0.9)).wall;
  wall = keepFish(wall, keeper('minnow', 'v3', 0.9, 'moon_minnow')).wall;
  wall = keepFish(wall, keeper('king', 'v4', 0.1, 'old_kingfish')).wall;
  const lines = wallLines(wall);
  assert.deepEqual(lines.map((l) => l.catchId), ['king', 'big-carp', 'minnow']);
  for (let i = 1; i < lines.length; i += 1) assert.ok(lines[i - 1].grams >= lines[i].grams);
  assert.equal(lines[1].light, 'day');
  assert.equal(lines[1].water, 'the home pond');
});

test('weight grows with size for every species and reads in lb and oz', () => {
  for (const species of Object.keys(TUNING.wall.weight) as Keeper['species'][]) {
    assert.ok(weightGrams(species, 0.9) > weightGrams(species, 0.1), species);
  }
  assert.equal(formatWeight(453.59237), '1 lb');
  assert.equal(formatWeight(28.35 * 18), '1 lb 2 oz');
  assert.equal(formatWeight(28.35 * 5), '5 oz');
  // The plausible band: a carp is pounds, not grams or tonnes.
  const carp = weightGrams('bronze_carp', 0.5);
  assert.ok(carp > 2000 && carp < 40000, `carp ${carp} g`);
});

test('a corrupt wall loads as empty, a good one survives', () => {
  assert.deepEqual(migrateWall('nonsense'), emptyWall());
  assert.deepEqual(migrateWall({ schemaVersion: 9, keepers: [] }), emptyWall());
  const good = keepFish(emptyWall(), keeper('a', 'v1', 0.3)).wall;
  assert.deepEqual(migrateWall(JSON.parse(JSON.stringify(good))), good);
  assert.equal(migrateWall({ schemaVersion: 1, keepers: [{ catchId: 'x' }] }).keepers.length, 0);
});
