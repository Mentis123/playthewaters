import assert from 'node:assert/strict';
import { test } from 'node:test';

import { deviceLabel, gateTally, habitsMentioned } from '../../src/game/dev/playtest';

test('open answers are tagged with the habits they mention', () => {
  assert.deepEqual(habitsMentioned('The big shadows always hung out by the reeds'), ['homes']);
  assert.deepEqual(habitsMentioned('More fish came close once it got dark'), ['lights']);
  assert.deepEqual(habitsMentioned('If I landed it right on them they bolted'), ['spook']);
  assert.deepEqual(habitsMentioned('one fish only bit when I left it alone, there was a ring'), ['still']);
  assert.deepEqual(habitsMentioned('nothing really, it was relaxing'), []);
});

test('the gate passes a habit named by three of five, not two', () => {
  const answers = [
    'they stayed near the stones',
    'same spot every time',
    'scared them by casting on top of them',
    'pretty, no idea',
    'fish by the rocks a lot'
  ];
  const tally = gateTally(answers);
  assert.equal(tally.counts.homes, 3);
  assert.deepEqual(tally.passing, ['homes']);
  assert.deepEqual(gateTally(answers.slice(0, 2)).passing, []);
});

test('device label never carries the full user agent', () => {
  const label = deviceLabel('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1', 390, 844);
  assert.equal(label, 'iPhone 390x844');
});
