import { useState } from 'react';
import { fetchClient } from '../api/FetchClient';
import { useCollection } from '../hooks/useCollection';
import { dateLabel } from '../config/modules';
import Modal from './Modal';
import { money } from '../utils/revenue';
export default function StockManager({ item, onClose, onSaved }) {
  const { rows, loading, error: loadError, reload } = useCollection('/materials/' + item.id + '/movements', 'Movimientos');
  const [values, setValues] = useState({ kind: 'entrada', quantity: '', note: '' });
  const [balance, setBalance] = useState(item.quantity);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [purchase, setPurchase] = useState(false);
  const [cost, setCost] = useState('');
  const [unit, setUnit] = useState(item.unit);
  const available = unit === item.unit ? balance : unit === 'L' ? balance / 1000 : balance * 1000;
  async function save(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage('');
    try {
      const result = await fetchClient.post('/materials/' + item.id + '/movements', { ...values, unit, quantity: Number(values.quantity), ...(purchase && values.kind === 'entrada' ? { total_cost: Number(cost) } : {}) });
      setBalance(result.material.quantity);
      setValues({ kind: 'entrada', quantity: '', note: '' });
      setPurchase(false); setCost('');
      setMessage('Movimiento guardado.');
      onSaved(); reload();
    } catch (failure) { setMessage(failure.message); }
    finally { setBusy(false); }
  }
  return <Modal title={'Inventario · ' + item.name} onClose={onClose} busy={busy} wide>
    <div className="balance"><span>Disponible</span><strong>{Number(balance.toFixed(3))} <small>{item.unit}</small></strong></div>
    {message && <div role="status" className="notice">{message}</div>}
    {!item.active && <div className="notice">Reactiva el material para registrar entradas o salidas.</div>}
    <form onSubmit={save}><fieldset disabled={busy || !item.active}><div className="form-grid">
      <label>Movimiento<select value={values.kind} onChange={e => setValues({ ...values, kind: e.target.value })}><option value="entrada">Entrada</option><option value="salida">Salida / consumo</option></select></label>
      <label>Unidad<select value={unit} onChange={e => setUnit(e.target.value)}>{(item.unit === 'ml' || item.unit === 'L' ? [['ml','Mililitros (ml)'],['L','Litros (L)']] : [[item.unit,item.unit === 'piezas' ? 'Piezas' : item.unit]]).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Cantidad ({unit})<input required type="number" min={unit === 'piezas' ? 1 : .001} step={unit === 'piezas' ? 1 : .001} max={values.kind === 'salida' ? available : undefined} value={values.quantity} onChange={e => setValues({ ...values, quantity: e.target.value })} /></label>
      {values.kind === 'entrada' && <label className="full"><input type="checkbox" checked={purchase} onChange={e => setPurchase(e.target.checked)} /> Registrar como compra</label>}
      {values.kind === 'entrada' && purchase && <label className="full">Costo total de esta compra (MXN)<input required type="number" min="0" step="0.01" max="999999999.99" value={cost} onChange={e => setCost(e.target.value)} /><small>Importe pagado por toda la cantidad ingresada. Ejemplo: 1 L de APC por $100; si tu unidad es ml, registra 1000 ml.</small></label>}
      <label className="full">Motivo<input required maxLength="500" placeholder="Compra, consumo en una cita, ajuste por conteo…" value={values.note} onChange={e => setValues({ ...values, note: e.target.value })} /></label>
    </div><div className="modal-actions"><button className="primary">{busy ? 'Guardando…' : 'Registrar movimiento'}</button></div></fieldset></form>
    <h3>Historial de movimientos</h3>
    {!loading && !loadError && <p>Total de compras registradas: <strong>{money(rows.reduce((sum, row) => sum + Math.round((row.total_cost ?? 0) * 100), 0) / 100)}</strong></p>}
    {loadError && <div className="notice error" role="alert">{loadError}<button className="text-button" onClick={reload}>Reintentar</button></div>}
    {loading ? <p role="status">Cargando historial…</p> : <div className="history">{rows.map(row => <div key={row.id}><span className={'badge ' + (row.kind === 'entrada' ? 'success' : '')}>{row.kind === 'entrada' ? '+' : '−'}{row.quantity} {item.unit}</span><div><strong>{row.note}</strong>{row.total_cost != null && <small>Compra · {money(row.total_cost)} total · {money(row.total_cost / row.quantity)} / {item.unit}</small>}<small>{dateLabel(row.created_at)} · {row.user}</small></div></div>)}{!rows.length && !loadError && <p>Aún no hay movimientos.</p>}</div>}
  </Modal>;
}



