import { useCollection } from '../hooks/useCollection';
import { money } from '../utils/revenue';
export default function PurchaseSummary() {
  const {rows, loading, error, reload} = useCollection('/materials/purchases-summary', 'Resumen');
  return <section className="stats revenue-stats" aria-label="Compras de materiales"><div className="stat"><span className="stat-icon">$</span><span>Compras de este mes</span><strong>{loading ? '…' : error ? '—' : money(rows[0]?.total ?? 0)}</strong><small>Total de todos los materiales · MXN · horario de Ciudad de México</small>{error && <button className="text-button" onClick={reload}>Reintentar</button>}</div></section>;
}
