import { useState } from 'react';
import { fetchClient, session } from '../api/FetchClient';
export default function Login({ onLogin, notice }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError('');
    try {
      const result = await fetchClient.post('/login', { email, contraseña: password });
      if (!result.token) throw new Error('El servidor no devolvió una sesión válida.');
      session.set(result.token);
      const user = await fetchClient.get('/user/me');
      onLogin(user);
    } catch (failure) { session.clear(); setError(failure.message); }
    finally { setBusy(false); }
  }
  return <div className="login-page"><section className="login-story"><a className="brand" href="#overview">LS 1713<small>CAR DETAILING</small></a><div><span className="eyebrow">EL DETALLE TAMBIÉN ESTÁ EN LA GESTIÓN</span><h1>Tu negocio.<br />Bajo control.</h1><p>Citas, servicios, videos y materiales.<br />Todo listo para tu siguiente gran trabajo.</p></div><small>ADMINISTRACIÓN / LS 1713</small></section><main className="login-form"><div><span className="eyebrow">BIENVENIDO DE NUEVO</span><h2>Inicia sesión.</h2><p>Accede con tu cuenta de administrador.</p>{notice && <div className="notice">{notice}</div>}{error && <div className="notice error" role="alert">{error}</div>}
    <form onSubmit={submit}><fieldset disabled={busy}><label>Correo electrónico<input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></label><label>Contraseña<input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></label><button className="primary">{busy ? 'Iniciando sesión…' : 'Entrar al panel ↗'}</button></fieldset></form><small>Acceso exclusivo para administradores autorizados.</small></div></main></div>;
}

