export const modules = {
  appointments: {
    title: 'Citas', subtitle: 'Organiza cada visita y mantén tu agenda al día.', singular: 'cita', endpoint: '/appointments', id: 'id_appointment',
    fields: [
      { key: 'name', label: 'Nombre del cliente', required: true },
      { key: 'numero_whatsapp', label: 'Número de WhatsApp', type: 'tel', required: true },
      { key: 'direccion', label: 'Dirección', required: true },
      { key: 'id_service', label: 'Servicio', type: 'service', required: true },
      { key: 'scheduled_date', label: 'Fecha y hora (hora local)', type: 'datetime-local', required: true },
      { key: 'status', label: 'Estado', type: 'select', options: [['Pending','Pendiente'],['Completed','Completada'],['Canceled','Cancelada']], editOnly: true },
    ],
    columns: [['name','Cliente'],['servicio','Servicio'],['scheduled_date','Fecha y hora'],['status','Estado']],
  },
  services: {
    title: 'Servicios', subtitle: 'Define los servicios que tus clientes pueden reservar.', singular: 'servicio', endpoint: '/services', root: 'Servicios', id: 'id_servicio',
    fields: [
      { key: 'name', label: 'Nombre del servicio', required: true },
      { key: 'price', label: 'Precio (MXN)', type: 'number', required: true, step: '1' },
      { key: 'tipo', label: 'Paquete', type: 'select', required: true, options: ['Express','Basico','Premium','Supreme','Extra'] },
      { key: 'vehiculo', label: 'Tipo de vehículo', type: 'select', options: [['','Todos / sin especificar'],['MOTO','Moto'],['AUTO','Auto'],['SUV','SUV'],['SUV_G','SUV grande'],['PICKUP','Pickup'],['PICKUP_G','Pickup grande']] },
    ],
    columns: [['nombre','Servicio'],['tipo','Paquete'],['vehiculo','Vehículo'],['precio','Precio']],
  },
  portfolio: {
    title: 'Videos', subtitle: 'Cada carro, su servicio y el resultado. Comparte tu trabajo.', singular: 'video', endpoint: '/portfolio', root: 'Servicios', id: 'id_servicio',
    fields: [
      { key: 'car_model', label: 'Nombre del carro', required: true },
      { key: 'service_id', label: 'Servicio realizado', type: 'service', required: true },
      { key: 'video_url', label: 'Enlace completo del video', type: 'url', required: true, maxLength: 200, help: 'TikTok: https://www.tiktok.com/@usuario/video/ID. También puedes usar un archivo MP4.' },
      { key: 'description', label: 'Descripción del trabajo', type: 'textarea' },
      { key: 'date', label: 'Fecha del trabajo (hora local)', type: 'datetime-local' },
    ],
    columns: [['carro','Carro'],['servicio','Servicio'],['fecha','Fecha'],['url','Video']],
  },
  materials: {
    title: 'Materiales', subtitle: 'Controla tus existencias, usos y diluciones en un solo lugar.', singular: 'material', endpoint: '/materials', root: 'Materiales', id: 'id',
    fields: [
      { key: 'name', label: 'Nombre del material', required: true },
      { key: 'category', label: 'Categoría', type: 'select', required: true, options: ['Químico','Herramienta','Consumible'] },
      { key: 'purpose', label: '¿Para qué se utiliza?', type: 'textarea', required: true },
      { key: 'unit', label: 'Unidad de medida', type: 'select', required: true, options: [['ml','Mililitros (ml)'],['L','Litros (L)'],['piezas','Piezas (cepillos, guantes, botes, brochas)'],['g','Gramos (g)'],['kg','Kilogramos (kg)']], help: 'La unidad no se puede cambiar después de registrar movimientos.' },
      { key: 'quantity', label: 'Existencia inicial', type: 'number', createOnly: true, step: '0.001', required: true },
      { key: 'minimum', label: 'Existencia mínima', type: 'number', step: '0.001', required: true },
      { key: 'notes', label: 'Notas e indicaciones', type: 'textarea' },
      { key: 'active', label: 'Material activo', type: 'checkbox', editOnly: true },
    ],
    columns: [['name','Material'],['category','Categoría'],['purpose','Uso'],['quantity','Disponible'],['stock','Estado']],
  },
};
export const statusNames = { Pending: 'Pendiente', Completed: 'Completada', Canceled: 'Cancelada' };
export const dateLabel = value => value ? new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
export function localDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,16);
}
export function formValues(name, item) {
  if (!item) return { active: true, quantity: 0, minimum: 0, dilutions: [], date: localDate(new Date().toISOString()) };
  if (name === 'services') {
    const vehicles = { 'SUV Grande': 'SUV_G', 'Pickup grande': 'PICKUP_G', 'Pickup': 'PICKUP', 'Auto': 'AUTO', 'Moto': 'MOTO' };
    return { name: item.nombre, price: item.precio, tipo: item.tipo, vehiculo: vehicles[item.vehiculo] || item.vehiculo || '' };
  }
  if (name === 'portfolio') return { car_model: item.carro, service_id: item.service_id, video_url: item.url, description: item.descripcion || '', date: localDate(item.fecha) };
  if (name === 'appointments') return { ...item, scheduled_date: localDate(item.scheduled_date) };
  return { ...item, dilutions: structuredClone(item.dilutions || []) };
}
export function submission(name, values, editing) {
  const data = {};
  for (const field of modules[name].fields) {
    if ((field.editOnly && !editing) || (field.createOnly && editing)) continue;
    let value = values[field.key] ?? '';
    if (field.type === 'datetime-local') {
      if (!value) continue;
      value = new Date(value).toISOString();
    }
    if (field.type === 'number' || field.type === 'service') value = value === '' ? null : Number(value);
    if (field.type === 'checkbox') value = Boolean(value);
    data[field.key] = value;
  }
  if (name === 'materials') data.dilutions = (values.dilutions || []).map(row => ({ ...row, product: Number(row.product), water: Number(row.water) }));
  return data;
}


