import { money, revenue } from '../utils/revenue';
export default function RevenueCards({ rows, loading, error, monthlyOnly = false }) {
  const totals = revenue(rows);
  const cards = monthlyOnly ? [['Ganado este mes', 'monthly']] : [['Ganado total', 'total'], ['Ganado este mes', 'monthly'], ['Citas pendientes', 'pending']];
  return <section aria-label="Ingresos de citas">
    <div className="stats revenue-stats">{cards.map(([label, key]) => <div className="stat" key={key}><span className="stat-icon">$</span><span>{label}</span><strong>{loading ? '…' : error || totals.missing ? '—' : money(totals[key])}</strong><small>{key === 'pending' ? 'Importe por cobrar · MXN' : 'Citas completadas · MXN'}</small></div>)}</div>
    <p className="revenue-note">Mes según la fecha de la cita, en horario de Ciudad de México. Ingresos antes de gastos.{totals.estimated && ' Las citas antiguas sin precio guardado se estiman con el precio actual del servicio.'}{totals.missing && ' Hay citas sin importe disponible; actualiza el backend o revisa su servicio.'}{error && ' No se pudieron cargar los ingresos.'}</p>
  </section>;
}
