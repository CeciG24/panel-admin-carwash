import { useCollection } from '../hooks/useCollection';
import { dateLabel } from '../config/modules';
import RevenueCards from '../components/RevenueCards';
export default function Overview({ user }) {
  const appointments = useCollection('/appointments');
  const services = useCollection('/services', 'Servicios');
  const videos = useCollection('/portfolio', 'Servicios');
  const materials = useCollection('/materials', 'Materiales');
  const pending = appointments.rows.filter(item => item.status === 'Pending');
  const upcoming = pending.filter(item => new Date(item.scheduled_date) >= new Date()).sort((a,b) => new Date(a.scheduled_date)-new Date(b.scheduled_date)).slice(0,5);
  const low = materials.rows.filter(item => item.active && item.low_stock);
  const stats = [
    ['Citas pendientes', appointments, pending.length, 'appointments', '◷'],
    ['Servicios', services, services.rows.length, 'services', '✧'],
    ['Videos publicados', videos, videos.rows.length, 'portfolio', '▷'],
    ['Materiales por reponer', materials, low.length, 'materials', '▧'],
  ];
  return <>
    <header className="page-heading"><div><span className="eyebrow">TU NEGOCIO, EN ORDEN</span><h1>Hola, {user.nombre.split(' ')[0]}.</h1><p>Un vistazo a lo que necesita tu atención hoy.</p></div><a href="#appointments" className="primary">Ver agenda ↗</a></header>
    <div className="stats">{stats.map(([title,state,value,path,icon]) => <a href={'#' + path} className="stat" key={title}><span className="stat-icon">{icon}</span><span>{title}</span><strong>{state.loading ? '…' : state.error ? '—' : value}</strong><small>{state.error ? 'No disponible · abrir para revisar' : 'Ver detalles ↗'}</small></a>)}</div>
    <RevenueCards rows={appointments.rows} loading={appointments.loading} error={appointments.error} monthlyOnly />
    <div className="overview-grid"><section className="panel"><div className="section-title"><div><span className="eyebrow">AGENDA</span><h2>Próximas visitas</h2></div><a href="#appointments">Ver todas →</a></div>
      {appointments.error ? <div className="notice error">{appointments.error}<button className="text-button" onClick={appointments.reload}>Reintentar</button></div> : appointments.loading ? <p>Cargando citas…</p> : upcoming.length ? <div className="agenda">{upcoming.map(item => <div key={item.id_appointment}><span className="avatar">{item.name.charAt(0)}</span><div><strong>{item.name}</strong><small>{item.servicio}</small></div><time>{dateLabel(item.scheduled_date)}</time></div>)}</div> : <div className="empty-state compact"><span>◷</span><p>No tienes visitas pendientes próximas.</p></div>}
    </section><section className="panel"><div className="section-title"><div><span className="eyebrow">INVENTARIO</span><h2>Para reponer</h2></div><a href="#materials">Ver materiales →</a></div>
      {materials.error ? <div className="notice error">{materials.error}<button className="text-button" onClick={materials.reload}>Reintentar</button></div> : materials.loading ? <p>Cargando inventario…</p> : low.length ? <div className="stock-list">{low.slice(0,5).map(item => <div key={item.id}><div><strong>{item.name}</strong><small>Mínimo: {item.minimum} {item.unit}</small></div><span className="badge warning">{item.quantity} {item.unit}</span></div>)}</div> : <div className="empty-state compact"><span>✓</span><p>No hay materiales activos por debajo del mínimo.</p></div>}
    </section></div>
    <div className="welcome-banner"><div><span className="eyebrow">CUIDADO EN CADA DETALLE</span><h2>Más orden. Más tiempo para tus clientes.</h2><p>Administra tu agenda y tus recursos desde un mismo lugar.</p></div><span aria-hidden="true">LS<br />1713</span></div>
  </>;
}

