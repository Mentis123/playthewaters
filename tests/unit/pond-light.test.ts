import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  advancePhase,
  blendWeight,
  celestialDirection,
  createLightSample,
  hexToRgb,
  LIGHT_NAMES,
  nearestLight,
  phaseOf,
  sampleLightInto,
  startPhaseForVisit,
  wrapPhase,
  type Rgb
} from '../../src/game/light/pondLight';
import { TUNING } from '../../src/game/tuning/tuning';

test('each key phase samples exactly its own palette', () => {
  const sample = createLightSample();
  for (const name of LIGHT_NAMES) {
    sampleLightInto(phaseOf(name), sample);
    assert.equal(sample.name, name);
    assert.deepEqual(sample.skyZenith, hexToRgb(TUNING.light.keys[name].skyZenith));
    assert.equal(sample.exposure, TUNING.light.keys[name].exposure);
  }
});

test('the light holds on its key through the plateau', () => {
  const sample = createLightSample();
  const quarter = 1 / LIGHT_NAMES.length;
  sampleLightInto(phaseOf('dusk') + quarter * TUNING.light.plateau * 0.9, sample);
  assert.deepEqual(sample.waterDeep, hexToRgb(TUNING.light.keys.dusk.waterDeep));
});

test('the light never jumps: sampling is continuous across the whole cycle, including the wrap', () => {
  const a = createLightSample();
  const b = createLightSample();
  const step = 1 / 20000;
  let worst = 0;
  for (let p = 0; p < 1; p += step) {
    sampleLightInto(p, a);
    sampleLightInto(p + step, b);
    for (const field of ['skyZenith', 'waterDeep', 'fog', 'key'] as const) {
      for (let c = 0; c < 3; c++) worst = Math.max(worst, Math.abs(a[field][c] - b[field][c]));
    }
    worst = Math.max(worst, Math.abs(a.exposure - b.exposure) / 2);
  }
  assert.ok(worst < 0.01, `largest per-step colour change ${worst}`);
});

test('blend weight is 0 at the start of a quarter and 1 at the end', () => {
  assert.equal(blendWeight(0), 0);
  assert.equal(blendWeight(1), 1);
  assert.ok(blendWeight(0.5) > 0.4 && blendWeight(0.5) < 0.6);
});

test('advancing a whole cycle returns to the same phase; one light lasts about ten minutes', () => {
  const start = 0.37;
  const cycleSeconds = 1 / TUNING.light.cyclePerSecond;
  assert.ok(Math.abs(advancePhase(start, cycleSeconds) - start) < 1e-9);
  const quarterMinutes = cycleSeconds / LIGHT_NAMES.length / 60;
  assert.ok(quarterMinutes >= 8 && quarterMinutes <= 12, `a light lasts ${quarterMinutes} min`);
  assert.equal(advancePhase(start, -5), start, 'negative dt never rewinds the light');
});

test('a first visit opens before the dusk turn', () => {
  const phase = startPhaseForVisit(null, () => 0.5);
  assert.equal(nearestLight(phase), 'dusk');
  assert.ok(phase < phaseOf('dusk'), 'first visit sees the light turn to dusk');
});

test('a return visit starts at a different light than the one left', () => {
  for (const name of LIGHT_NAMES) {
    for (const r of [0, 0.25, 0.5, 0.75, 0.999]) {
      const left = phaseOf(name);
      const next = startPhaseForVisit(left, () => r);
      const moved = wrapPhase(next - left);
      assert.ok(moved >= TUNING.light.returnJumpMin - 1e-9, `moved ${moved}`);
      assert.notEqual(nearestLight(next), name, `left ${name}, returned to ${nearestLight(next)} (r=${r})`);
    }
  }
});

test('celestial direction points over the far water at azimuth 0 and up at 90 degrees', () => {
  const out: Rgb = [0, 0, 0];
  celestialDirection(0, 0, out);
  assert.ok(Math.abs(out[2] + 1) < 1e-9 && Math.abs(out[1]) < 1e-9);
  celestialDirection(90, 0, out);
  assert.ok(Math.abs(out[1] - 1) < 1e-9);
});

test('look and light overrides parse only known values', async () => {
  const { readLook, readLightOverride } = await import('../../src/game/light/look');
  assert.equal(readLook(''), 'alpha');
  assert.equal(readLook('?look=classic'), 'classic');
  assert.equal(readLook('?look=CLASSIC'), 'alpha');
  assert.equal(readLook('?look=a1'), 'a1');
  assert.equal(readLook('?look=a9'), 'alpha');
  assert.equal(readLightOverride('?light=dusk&seed=2'), 'dusk');
  assert.equal(readLightOverride('?light=noon'), null);
  assert.equal(readLightOverride(''), null);
});

test('blind tokens resolve to their arm and never leak the look into the URL', async () => {
  const { resolveAbSearch } = await import('../../src/game/light/look');
  const table = JSON.stringify({ tokens: { k7x: { look: 'classic', light: 'night' }, q2m: { look: 'alpha', light: 'dusk' } } });
  assert.equal(resolveAbSearch('?pond=k7x', () => table), '?look=classic&light=night');
  assert.equal(resolveAbSearch('?pond=q2m&seed=s', () => table), '?seed=s&light=dusk');
  assert.equal(resolveAbSearch('?pond=nope', () => table), '');
  assert.equal(resolveAbSearch('?pond=k7x', () => '{broken'), '');
  assert.equal(resolveAbSearch('?light=day', () => table), '?light=day');
  const a2 = JSON.stringify({ tokens: { p1: { look: 'a1', light: 'day' } } });
  assert.equal(resolveAbSearch('?pond=p1', () => a2), '?look=a1&light=day');
});
