import { fetchClient } from './FetchClient';

export const servicesAPI = {
    getAll: () => fetchClient.get('/services'),
    getDescriptions: () => fetchClient.get('/services/descriptions'),
    getById: (id) => fetchClient.get(`/services/${id}`),
    getDescriptionById: (id) => fetchClient.get(`/services/descriptions/${id}`),
    create: (data) => fetchClient.post('/services', data),
    createDescription: (data) => fetchClient.post('/services/descriptions', data),
    update: (id, data) => fetchClient.put(`/services/${id}`, data),
    updateDescription: (id, data) => fetchClient.put(`/services/descriptions/${id}`, data),
    delete: (id) => fetchClient.delete(`/services/${id}`),
    deleteDescription: (id) => fetchClient.delete(`/services/descriptions/${id}`),
};
