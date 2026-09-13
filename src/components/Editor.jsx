import { safeVideoUrl } from '../utils/video';
import { useState } from 'react';
import { fetchClient } from '../api/FetchClient';
import { modules, formValues, submission } from '../config/modules';
import Modal from './Modal';

function VideoPreview({ url }) {
  const parsed = safeVideoUrl(url);
  if (!parsed) return null;
  const match = (parsed.hostname === 'tiktok.com' || parsed.hostname.endsWith('.tiktok.com')) && parsed.pathname.match(/^\/@[^/]+\/video\/(\d+)\/?$/);
  return <div className="video-preview">{match ? <iframe title="Vista previa del TikTok" src={`https://www.tiktok.com/player/v1/${match[1]}?autoplay=0`} allow="fullscreen" allowFullScreen /> : <a href={parsed.href} target="_blank" rel="noopener noreferrer">Abrir video para revisar ↗</a>}</div>;
}
export default function Editor({ name, item, services, onClose, onSaved }) {
  const schema = modules[name];
  const [values, setValues] = useState(() => formValues(name, item));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const update = (key, value) => setValues(previous => ({ ...previous, [key]: value }));
  async function save(event) {
    event.preventDefault();
    if (busy) return;
    setError(''); setBusy(true);
    try {
      const data = submission(name, values, Boolean(item));
      if (name === 'appointments' && item && values.scheduled_date === formValues(name, item).scheduled_date) delete data.scheduled_date;
      if (item) await fetchClient.put(schema.endpoint + '/' + item[schema.id], data);
      else await fetchClient.post(schema.endpoint, data);
      onSaved();
    } catch (failure) { setError(failure.message); setBusy(false); }
  }
  return <Modal title={`${item ? 'Editar' : 'Crear'} ${schema.singular}`} onClose={onClose} busy={busy} wide>
    <form onSubmit={save}>
      {error && <div className="notice error" role="alert">{error}</div>}
      <fieldset disabled={busy}><div className="form-grid">
        {schema.fields.filter(field => !(field.editOnly && !item) && !(field.createOnly && item)).map(field => {
          const options = field.type === 'service' ? services.map(service => [service.id_servicio, service.nombre]) : (field.options || []).map(option => Array.isArray(option) ? option : [option, option]);
          return <div className={field.type === 'textarea' || field.help ? 'field full' : 'field'} key={field.key}>
            <label htmlFor={'field-' + field.key}>{field.label}{field.required && <span aria-hidden="true"> *</span>}</label>
            {['select','service'].includes(field.type) ? <select id={'field-' + field.key} value={values[field.key] ?? ''} required={field.required} onChange={e => update(field.key, e.target.value)}>
              {field.required && <option value="">Selecciona una opción</option>}
              {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select> : field.type === 'textarea' ? <textarea id={'field-' + field.key} rows="3" maxLength={10000} required={field.required} value={values[field.key] ?? ''} onChange={e => update(field.key, e.target.value)} />
            : field.type === 'checkbox' ? <input id={'field-' + field.key} type="checkbox" checked={!!values[field.key]} onChange={e => update(field.key, e.target.checked)} />
            : <input id={'field-' + field.key} type={field.type || 'text'} min={field.type === 'number' ? 0 : undefined} step={field.step} maxLength={field.maxLength || 100} required={field.required} value={values[field.key] ?? ''} onChange={e => update(field.key, e.target.value)} />}
            {field.help && <small>{field.help}</small>}
          </div>;
        })}
      </div>
      {name === 'portfolio' && values.video_url && <VideoPreview url={values.video_url} />}
      {name === 'materials' && <section className="dilutions">
        <div className="section-title"><div><h3>Diluciones por uso</h3><p>Proporción producto : agua. Transcribe las indicaciones del fabricante.</p></div><button type="button" className="secondary" onClick={() => update('dilutions', [...(values.dilutions || []), { use: '', product: 1, water: 0, instructions: '' }])}>+ Agregar</button></div>
        {(values.dilutions || []).map((row, index) => {
          const change = (key, value) => update('dilutions', values.dilutions.map((entry, i) => i === index ? { ...entry, [key]: value } : entry));
          return <div className="dilution-row" key={index}>
            <label>Uso<input required maxLength="200" value={row.use} onChange={e => change('use', e.target.value)} /></label>
            <label>Producto<input required type="number" min=".001" step=".001" value={row.product} onChange={e => change('product', e.target.value)} /></label>
            <label>Agua<input required type="number" min="0" step=".001" value={row.water} onChange={e => change('water', e.target.value)} /></label>
            <label className="full">Indicaciones<input maxLength="1000" value={row.instructions} onChange={e => change('instructions', e.target.value)} /></label>
            <button type="button" className="text-button danger" aria-label={`Quitar dilución ${index+1}`} onClick={() => update('dilutions', values.dilutions.filter((_, i) => i !== index))}>Quitar</button>
          </div>;
        })}
      </section>}
      <div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}</button></div>
      </fieldset>
    </form>
  </Modal>;
}


