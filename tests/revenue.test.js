import test from 'node:test';
import assert from 'node:assert/strict';
import { revenue } from '../src/utils/revenue.js';
test('income excludes canceled appointments and uses Mexico City month boundaries', () => {
  const totals = revenue([
    {status:'Completed', amount:100, scheduled_date:'2026-09-01T05:59:00Z'},
    {status:'Completed', amount:200.25, scheduled_date:'2026-09-01T06:00:00Z'},
    {status:'Completed', amount:0.1, scheduled_date:'2026-09-15T06:00:00Z'},
    {status:'Pending', amount:300, scheduled_date:'2026-10-10T12:00:00Z'},
    {status:'Canceled', amount:999, scheduled_date:'2026-09-10T12:00:00Z'},
  ], new Date('2026-09-20T12:00:00Z'));
  assert.equal(totals.total, 300.35);
  assert.equal(totals.monthly, 200.35);
  assert.equal(totals.pending, 300);
});
test('missing and historical prices are identified', () => {
  const result = revenue([{status:'Completed', amount:null}, {status:'Pending', amount:10, amount_estimated:true}]);
  assert.equal(result.missing, true);
  assert.equal(result.estimated, true);
});
