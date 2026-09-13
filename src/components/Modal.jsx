import { useEffect, useRef } from 'react';
export default function Modal({ title, onClose, children, busy = false, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const focus = document.activeElement;
    dialog.showModal();
    return () => { dialog.close(); if (focus?.isConnected) focus.focus(); };
  }, []);
  return <dialog className={wide ? 'modal wide' : 'modal'} ref={ref} aria-labelledby="modal-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="modal-heading"><div><span className="eyebrow">LS 1713 / ADMINISTRACIÓN</span><h2 id="modal-title">{title}</h2></div><button type="button" className="icon-button" aria-label="Cerrar ventana" disabled={busy} onClick={onClose}>✕</button></div>
    {children}
  </dialog>;
}

