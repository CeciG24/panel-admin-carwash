import { useEffect, useState } from 'react';
import { fetchClient, session } from './api/FetchClient';
import { modules } from './config/modules';
import { useCollection } from './hooks/useCollection';
import Login from './pages/Login';
import Overview from './pages/Overview';
import CollectionPage from './pages/CollectionPage';

const links = [['overview','Resumen','◈'],['appointments','Citas','◷'],['services','Servicios','✧'],['portfolio','Videos','▷'],['materials','Materiales','▧']];
function route() {
  const value = window.location.hash.replace('#','');
  return value === 'overview' || modules[value] ? value : 'overview';
}
function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState(route);
  const [open, setOpen] = useState(false);
  const services = useCollection('/services', 'Servicios');
  const reloadServices = services.reload;
  useEffect(() => {
    const change = () => { setPage(route()); setOpen(false); window.scrollTo(0,0); reloadServices(); };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, [reloadServices]);
  return <div className="admin-layout"><aside className={'sidebar ' + (open ? 'is-open' : '')}>
    <a href="#overview" className="brand">LS 1713<small>CAR DETAILING</small></a><span className="sidebar-label">ESPACIO DE TRABAJO</span>
    <nav aria-label="Administración">{links.map(([key,label,icon]) => <a href={'#' + key} key={key} className={page === key ? 'active' : ''} aria-current={page === key ? 'page' : undefined}><span aria-hidden="true">{icon}</span>{label}</a>)}</nav>
    <div className="sidebar-bottom"><div className="owner"><span className="avatar">{user.nombre.charAt(0)}</span><div><strong>{user.nombre}</strong><small>Administrador</small></div></div><button onClick={onLogout}>Cerrar sesión ↗</button></div>
  </aside>
  {open && <button className="sidebar-backdrop" aria-label="Cerrar navegación" onClick={() => setOpen(false)} />}
  <div className="admin-body"><div className="topbar"><button className="menu-button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} onClick={() => setOpen(!open)}>☰</button><span>Administración <b>/ {page === 'overview' ? 'Resumen' : modules[page].title}</b></span><span className="today">{new Date().toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'})}</span></div><main className="main-content" id="main-content">
    {page === 'overview' ? <Overview user={user} /> : <CollectionPage key={page} name={page} services={services.rows} serviceError={services.error} />}
  </main><footer className="admin-footer">LS 1713 · Car Detailing <span>Cuidado en cada detalle.</span></footer></div></div>;
}
export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(session.get()));
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    if (session.get()) fetchClient.get('/user/me', { signal: controller.signal })
      .then(setUser)
      .catch(error => { if (error.name !== 'AbortError') { session.clear(); setNotice(error.message); } })
      .finally(() => { if (!controller.signal.aborted) setChecking(false); });
    const expired = () => { setUser(null); setNotice('Tu sesión expiró. Inicia sesión de nuevo.'); };
    window.addEventListener('admin-session-expired', expired);
    return () => { controller.abort(); window.removeEventListener('admin-session-expired', expired); };
  }, []);
  if (checking) return <div className="session-check" role="status">Comprobando tu sesión…</div>;
  if (!user) return <Login notice={notice} onLogin={value => { setUser(value); setNotice(''); }} />;
  return <Dashboard user={user} onLogout={() => { session.clear(); setUser(null); setNotice(''); }} />;
}


