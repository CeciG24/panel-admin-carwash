export const money = value => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
const month = date => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit' }).format(date);
export function revenue(rows, now = new Date()) {
  const result = { total: 0, monthly: 0, pending: 0, estimated: false, missing: false };
  for (const row of rows) {
    if (!['Completed', 'Pending'].includes(row.status)) continue;
    if (row.amount == null || !Number.isFinite(Number(row.amount))) { result.missing = true; continue; }
    const cents = Math.round(Number(row.amount) * 100);
    result.estimated ||= Boolean(row.amount_estimated);
    if (row.status === 'Pending') result.pending += cents;
    else {
      result.total += cents;
      const date = new Date(row.scheduled_date);
      if (!Number.isNaN(date.getTime()) && month(date) === month(now)) result.monthly += cents;
    }
  }
  for (const key of ['total', 'monthly', 'pending']) result[key] /= 100;
  return result;
}
