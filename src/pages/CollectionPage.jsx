import { safeVideoUrl } from '../utils/video';
import { useState } from 'react';
import { modules, statusNames, dateLabel } from '../config/modules';
import { useCollection } from '../hooks/useCollection';
import { fetchClient } from '../api/FetchClient';
import Editor from '../components/Editor';
import Modal from '../components/Modal';
import StockManager from '../components/StockManager';
import DescriptionManager from '../components/DescriptionManager';
import RevenueCards from '../components/RevenueCards';
import PurchaseSummary from '../components/PurchaseSummary';

function Cell({ name, field, item }) {
  const value = item[field];
  if (field === 'status') return <span className={'badge ' + (value === 'Completed' ? 'success' : value === 'Canceled' ? 'muted' : 'warning')}>{statusNames[value] || value}</span>;
  if (field === 'stock') return <span className={'badge ' + (!item.active ? 'muted' : item.low_stock ? 'warning' : 'success')}>{!item.active ? 'Inactivo' : item.low_stock ? 'Stock bajo' : 'Disponible'}</span>;
  if (['fecha','scheduled_date'].includes(field)) return dateLabel(value);
  if (field === 'precio') return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  if (field === 'quantity') return <strong>{value} <small>{item.unit}</small></strong>;
  if (field === 'url') {
    const url = safeVideoUrl(value);
    if (url) return <a href={url.href} target="_blank" rel="noopener noreferrer" className="text-button">Ver video ↗</a>;
    return 'Enlace no disponible';
  }
  if (name === 'materials' && field === 'name') return <div><strong>{value}</strong>{item.dilutions?.length > 0 && <small>{item.dilutions.length} dilución(es)</small>}</div>;
  return value || '—';
}
export default function CollectionPage({ name, services, serviceError }) {
  const schema = modules[name];
  const { rows, loading, error, reload } = useCollection(schema.endpoint, schema.root);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [stock, setStock] = useState(null);
  const [descriptions, setDescriptions] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [purchaseVersion, setPurchaseVersion] = useState(0);
  const filtered = rows.filter(item => {
    const matches = Object.values(item).filter(value => typeof value === 'string' || typeof value === 'number').join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase());
    return matches && (!filter || (name === 'appointments' ? item.status === filter : filter === 'low' ? item.active && item.low_stock : filter === 'inactive' ? !item.active : item.active));
  });
  const maxPage = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, maxPage);
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  async function remove() {
    if (busy) return;
    setBusy(true); setMessage('');
    try { await fetchClient.delete(schema.endpoint + '/' + deleting[schema.id]); setDeleting(null); setMessage('Registro eliminado.'); reload(); }
    catch (failure) { setMessage(failure.message); }
    finally { setBusy(false); }
  }
  return <>
    <header className="page-heading"><div><span className="eyebrow">GESTIONA TU NEGOCIO</span><h1>{schema.title}</h1><p>{schema.subtitle}</p></div><button className="primary" onClick={() => { setMessage(''); setEditor({ item: null }); }}>+ Crear {schema.singular}</button></header>
    {name === 'appointments' && <RevenueCards rows={rows} loading={loading} error={error} />}
    {name === 'materials' && <PurchaseSummary key={purchaseVersion} />}
    {message && !deleting && <div className="notice" role="status">{message}</div>}
    {serviceError && ['appointments','portfolio'].includes(name) && <div className="notice error">No se pudo cargar la lista de servicios: {serviceError}</div>}
    <section className="panel">
      <div className="table-toolbar"><label className="search"><span aria-hidden="true">⌕</span><input aria-label={'Buscar en ' + schema.title} placeholder="Buscar…" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} /></label>
        {['appointments','materials'].includes(name) && <select aria-label="Filtrar registros" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}><option value="">Todos</option>{name === 'appointments' ? Object.entries(statusNames).map(([value,label]) => <option key={value} value={value}>{label}</option>) : <><option value="low">Stock bajo</option><option value="active">Activos</option><option value="inactive">Inactivos</option></>}</select>}
        <button className="secondary" disabled={loading} onClick={reload}>Actualizar</button>
      </div>
      {error ? <div className="empty-state" role="alert"><span>↻</span><h2>No pudimos cargar {schema.title.toLowerCase()}</h2><p>{error}</p><button className="secondary" onClick={reload}>Reintentar</button></div>
      : loading ? <div className="empty-state" role="status">Cargando registros…</div>
      : !visible.length ? <div className="empty-state"><span>◇</span><h2>{query || filter ? 'Sin coincidencias' : 'Todo empieza con el primer registro'}</h2><p>{query || filter ? 'Prueba otra búsqueda o cambia el filtro.' : 'Agrega un registro para empezar a organizar esta sección.'}</p></div>
      : <div className="table-scroll"><table><thead><tr>{schema.columns.map(([key,label]) => <th key={key}>{label}</th>)}<th>Acciones</th></tr></thead><tbody>{visible.map(item => <tr key={item[schema.id]}>{schema.columns.map(([key]) => <td key={key}><Cell name={name} field={key} item={item} /></td>)}<td><div className="row-actions">
        {name === 'materials' && <button className="text-button" onClick={() => setStock(item)}>Movimientos</button>}
        {name === 'services' && <button className="text-button" onClick={() => setDescriptions(item)}>Descripciones</button>}
        <button className="text-button" onClick={() => { setMessage(''); setEditor({ item }); }}>Editar</button>
        <button className="text-button danger" onClick={() => { setMessage(''); setDeleting(item); }}>Eliminar</button>
      </div></td></tr>)}</tbody></table></div>}
      <div className="pagination"><span>{filtered.length} registros</span><div><button className="secondary" disabled={currentPage === 1 || loading} onClick={() => setPage(currentPage - 1)}>←</button><span>{currentPage} / {maxPage}</span><button className="secondary" disabled={currentPage === maxPage || loading} onClick={() => setPage(currentPage + 1)}>→</button></div></div>
    </section>
    {editor && <Editor name={name} item={editor.item} services={name === 'services' ? rows : services} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); setMessage('Cambios guardados.'); reload(); }} />}
    {deleting && <Modal title={'Eliminar ' + schema.singular} busy={busy} onClose={() => setDeleting(null)}><p>Vas a eliminar <strong>{deleting.name || deleting.nombre || deleting.carro}</strong>. Esta acción no se puede deshacer.</p>{name === 'materials' && <p>Si tiene movimientos, desactívalo desde Editar para conservar el historial.</p>}{message && <div className="notice error" role="alert">{message}</div>}<div className="modal-actions"><button className="secondary" disabled={busy} onClick={() => setDeleting(null)}>Cancelar</button><button className="danger-button" disabled={busy} onClick={remove}>{busy ? 'Eliminando…' : 'Eliminar registro'}</button></div></Modal>}
    {stock && <StockManager item={stock} onClose={() => setStock(null)} onSaved={() => { reload(); setPurchaseVersion(v => v + 1); }} />}
    {descriptions && <DescriptionManager item={descriptions} onClose={() => setDescriptions(null)} />}
  </>;
}


