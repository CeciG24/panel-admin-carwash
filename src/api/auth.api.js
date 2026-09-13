import { fetchClient, session } from './FetchClient';
export const authAPI = {
  login: credentials => fetchClient.post('/login', credentials),
  logout: () => { session.clear(); },
  getCurrentUser: () => fetchClient.get('/user/me'),
};

