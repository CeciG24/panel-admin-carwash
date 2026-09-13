import { fetchClient } from './FetchClient';

export const appointmentsAPI = {
  getAll: () => fetchClient.get('/appointments'),
  getById: (id) => fetchClient.get(`/appointments/${id}`),
  create: (data) => fetchClient.post('/appointments', data),
  update: (id, data) => fetchClient.put(`/appointments/${id}`, data),
  delete: (id) => fetchClient.delete(`/appointments/${id}`),
};
