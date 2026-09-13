import test from 'node:test';
import assert from 'node:assert/strict';
import { formValues, submission, localDate } from '../src/config/modules.js';
import { safeVideoUrl } from '../src/utils/video.js';
test('service fields map to API contract', () => {
  const values = formValues('services', { nombre: 'Lavado', precio: 300, tipo: 'Premium', vehiculo: 'SUV Grande' });
  assert.deepEqual(submission('services', values, true), { name: 'Lavado', price: 300, tipo: 'Premium', vehiculo: 'SUV_G' });
});
test('appointment date is sent with a timezone and create cannot set status', () => {
  const date = '2026-10-10T18:00:00.000Z';
  const result = submission('appointments', { name: 'A', numero_whatsapp: '1', direccion: 'B', id_service: '2', scheduled_date: localDate(date), status: 'Completed' }, false);
  assert.equal(result.scheduled_date, date);
  assert.equal(result.id_service, 2);
  assert.equal('status' in result, false);
});
test('material edits do not overwrite stock; ratios are numbers', () => {
  const data = submission('materials', { name: 'A', purpose: 'B', unit: 'ml', category: 'Químico', quantity: 200, minimum: '10', active: true, dilutions: [{ use: 'Test', product: '1', water: '9', instructions: '' }] }, true);
  assert.equal('quantity' in data, false);
  assert.equal(data.dilutions[0].water, 9);
});
test('external video links reject executable schemes', () => {
  assert.equal(safeVideoUrl('javascript:alert(1)'), null);
  assert.equal(safeVideoUrl('data:text/html,test'), null);
  assert.equal(safeVideoUrl('bad'), null);
  assert.equal(safeVideoUrl('https://www.tiktok.com/@test/video/123').hostname, 'www.tiktok.com');
});
