import test from 'node:test';
import assert from 'node:assert/strict';
import { yearlyReversalDays } from '../lib/clock-metrics.ts';

test('yearly reversal uses effective contributions only within the current UTC year up to today', () => {
  const events = [
    { id: 'old', date: '2025-12-31' },
    { id: 'start', date: '2026-01-01' },
    { id: 'partial', date: '2026-10-05' },
    { id: 'closer', date: '2026-10-04' },
    { id: 'future', date: '2026-10-06' },
    { id: 'unscored', date: '2026-10-03' },
  ];
  assert.equal(yearlyReversalDays(events, {old: -8, start: -2, partial: -.5, closer: 4, future: -3}, '2026-10-05'), 75);
  assert.equal(yearlyReversalDays(events, {start: -2}, '2027-01-01'), 0);
  assert.equal(yearlyReversalDays([], {}, '2026-10-05'), 0);
});
