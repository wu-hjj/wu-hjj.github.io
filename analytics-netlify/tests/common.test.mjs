import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDateUTC, amsterdamDay, allowedOrigin, recentDays} from '../netlify/functions/_common.mjs';

test('calendar validation', () => {
  assert.ok(parseDateUTC('2026-11-01'));
  assert.equal(parseDateUTC('2026-02-30'), null);
});
test('Amsterdam calendar day across daylight saving', () => {
  assert.equal(amsterdamDay(new Date('2026-11-01T00:30:00Z')), '2026-11-01');
  assert.equal(amsterdamDay(new Date('2026-10-31T22:30:00Z')), '2026-10-31');
});
test('origins and reporting date ranges', () => {
  assert.equal(allowedOrigin('https://wu-hjj.github.io'), true);
  assert.equal(allowedOrigin('https://evil.example'), false);
  assert.deepEqual(recentDays('2026-10-31', '2026-11-02'), ['2026-10-31','2026-11-01','2026-11-02']);
});
