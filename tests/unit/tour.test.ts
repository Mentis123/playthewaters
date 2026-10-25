import assert from 'node:assert/strict';
import { test } from 'node:test';

import { REVIEW } from '../../src/game/tour/review';
import { stopDone, TOURS, tourFor, uncheckedChecks, type TourProbe } from '../../src/game/tour/tours';

const probe: TourProbe = {
  started: true, water: 'home', state: 'scouting', walking: false, bagOpen: false, kept: '',
  foundSinker: false, seenBench: false, snagged: false, lureId: 'natural', rodId: 'long'
};
const counts = () => ({ casts: 0, shares: 0, castsByLure: {} as Record<string, number> });

test('the current review has a tour, and it asks every check', () => {
  const tour = tourFor(REVIEW.chapter);
  assert.ok(tour, `no tour for ${REVIEW.chapter}`);
  assert.deepEqual(uncheckedChecks(tour, REVIEW.checks.map((c) => c.id)), []);
});

test('a planted gap is caught: dropping a stop leaves its check unasked', () => {
  const tour = TOURS[REVIEW.chapter];
  const cut = { ...tour, stops: tour.stops.filter((s) => s.check !== 'a5-find') };
  assert.deepEqual(uncheckedChecks(cut, REVIEW.checks.map((c) => c.id)), ['a5-find']);
});

test('every stop check names a real check, and stop ids are unique', () => {
  const ids = new Set(REVIEW.checks.map((c) => c.id));
  for (const tour of Object.values(TOURS)) {
    const seen = new Set<string>();
    for (const stop of tour.stops) {
      if (stop.check) assert.ok(ids.has(stop.check), `${stop.id} asks unknown check ${stop.check}`);
      assert.ok(!seen.has(stop.id), `duplicate stop ${stop.id}`);
      seen.add(stop.id);
    }
  }
});

test('unknown tours are refused', () => {
  assert.equal(tourFor(null), null);
  assert.equal(tourFor('nope'), null);
  assert.equal(tourFor('__proto__'), null);
});

test('done conditions read the probe and the counts', () => {
  const tour = TOURS[REVIEW.chapter];
  const byId = (id: string) => tour.stops.find((s) => s.id === id)!;
  const popper = byId('lure-popper');
  assert.equal(stopDone(popper, probe, { ...counts(), casts: 1, castsByLure: { natural: 1 } }, ''), false);
  assert.equal(stopDone(popper, probe, { ...counts(), casts: 1, castsByLure: { popper: 1 } }, ''), true);
  const keep = byId('keep');
  assert.equal(stopDone(keep, { ...probe, kept: 'a' }, counts(), 'a'), false);
  assert.equal(stopDone(keep, { ...probe, kept: 'b' }, counts(), 'a'), true, 'a swap counts as a keep');
  const walk = byId('a5-walk');
  assert.equal(stopDone(walk, { ...probe, water: 'lily', walking: true }, counts(), ''), false);
  assert.equal(stopDone(walk, { ...probe, water: 'lily' }, counts(), ''), true);
  assert.equal(stopDone(byId('arrive'), probe, counts(), ''), false, 'look stops are never done');
});

// The legend's secrets never go out in a served string (A5_RUBRIC).
test('no tour line or check gives away how the legend is caught', () => {
  const secret = /sink|still|wait|second|dawn|dusk|light|old lure|quiet/i;
  const tour = TOURS[REVIEW.chapter];
  const legendText = [tour.stops.find((s) => s.id === 'a5-legend')!.line, REVIEW.checks.find((c) => c.id === 'a5-legend')!.text];
  for (const text of legendText) assert.doesNotMatch(text, secret, text);
});
