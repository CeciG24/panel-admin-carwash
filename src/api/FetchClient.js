export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://backend-car-wash.onrender.com').replace(/\/$/, '');
const SESSION_KEY = 'ls1713-admin-session';
export const session = {
  get: () => sessionStorage.getItem(SESSION_KEY),
  set: token => sessionStorage.setItem(SESSION_KEY, token),
  clear: () => sessionStorage.removeItem(SESSION_KEY),
};
class FetchClient {
  async request(path, options = {}) {
    const { timeout = 60000, ...requestOptions } = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const abort = () => controller.abort();
    requestOptions.signal?.addEventListener('abort', abort, { once: true });
    if (requestOptions.signal?.aborted) controller.abort();
    try {
      const token = session.get();
      const response = await fetch(API_BASE_URL + path, {
        ...requestOptions, signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...requestOptions.headers },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401 && token) {
          session.clear();
          window.dispatchEvent(new Event('admin-session-expired'));
        }
        const error = new Error(data.error || (response.status === 404 ? 'Esta función todavía no está disponible en el servidor.' : 'No se pudo completar la solicitud.'));
        error.status = response.status;
        throw error;
      }
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        if (requestOptions.signal?.aborted) throw error;
        throw new Error('El servidor tardó demasiado. Revisa si se guardó el cambio antes de volver a intentarlo.');
      }
      if (error instanceof TypeError) throw new Error('No hay conexión con el servidor. Comprueba tu conexión o inténtalo en un momento.');
      throw error;
    } finally {
      clearTimeout(timer);
      requestOptions.signal?.removeEventListener('abort', abort);
    }
  }
  get(path, options) { return this.request(path, options); }
  post(path, data) { return this.request(path, { method: 'POST', body: JSON.stringify(data) }); }
  put(path, data) { return this.request(path, { method: 'PUT', body: JSON.stringify(data) }); }
  delete(path) { return this.request(path, { method: 'DELETE' }); }
}
export const fetchClient = new FetchClient();

