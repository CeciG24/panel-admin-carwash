import { useState } from 'react';
import { fetchClient } from '../api/FetchClient';
import { useCollection } from '../hooks/useCollection';
import Modal from './Modal';
export default function DescriptionManager({ item, onClose }) {
  const { rows, loading, error, reload } = useCollection('/services/descriptions/' + item.id_servicio, 'Descripciones');
  const [selected, setSelected] = useState(null);
  const [text, setText] = useState('');
  const [order, setOrder] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function save(event) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setMessage('');
    try {
      const data = { service_id: item.id_servicio, description: text, order: Number(order) };
      if (selected) await fetchClient.put('/services/descriptions/' + selected, data);
      else await fetchClient.post('/services/descriptions', data);
      setSelected(null); setText(''); setOrder(0); setMessage('Descripción guardada.'); reload();
    } catch (failure) { setMessage(failure.message); }
    finally { setBusy(false); }
  }
  async function remove(row) {
    if (!window.confirm('¿Eliminar esta descripción?')) return;
    setBusy(true);
    try {
      await fetchClient.delete('/services/descriptions/' + row.id_description);
      if (selected === row.id_description) { setSelected(null); setText(''); }
      reload();
    } catch (failure) { setMessage(failure.message); }
    finally { setBusy(false); }
  }
  return <Modal title={'Descripciones · ' + item.nombre} onClose={onClose} busy={busy}>
    {(message || error) && <div role="status" className="notice">{message || error}</div>}
    {loading ? <p>Cargando…</p> : <div className="description-list">{rows.map(row => <div key={row.id_description}><p>{row.descripcion}</p><small>Orden {row.order}</small><div><button disabled={busy} className="text-button" onClick={() => { setSelected(row.id_description); setText(row.descripcion); setOrder(row.order); }}>Editar</button><button disabled={busy} className="text-button danger" onClick={() => remove(row)}>Eliminar</button></div></div>)}</div>}
    <form onSubmit={save}><fieldset disabled={busy}>
      <label>{selected ? 'Editar descripción' : 'Nueva descripción'}<textarea required maxLength="10000" rows="3" value={text} onChange={e => setText(e.target.value)} /></label>
      <label>Orden<input type="number" required min="0" step="1" value={order} onChange={e => setOrder(e.target.value)} /></label>
      <div className="modal-actions">{selected && <button className="secondary" type="button" onClick={() => { setSelected(null); setText(''); }}>Cancelar edición</button>}<button className="primary">{busy ? 'Guardando…' : 'Guardar descripción'}</button></div>
    </fieldset></form>
  </Modal>;
}

