import { useCallback, useEffect, useState } from 'react';
import { fetchClient } from '../api/FetchClient';
export function useCollection(endpoint, root) {
  const [state, setState] = useState({ rows: [], loading: true, error: '' });
  const load = useCallback(async signal => {
    setState(old => ({ ...old, loading: true, error: '' }));
    try {
      const result = await fetchClient.get(endpoint, { signal });
      const rows = root ? result[root] : result;
      if (!Array.isArray(rows)) throw new Error('El servidor devolvió un formato inesperado.');
      setState({ rows, loading: false, error: '' });
    } catch (error) {
      if (error.name !== 'AbortError') setState(old => ({ ...old, loading: false, error: error.message }));
    }
  }, [endpoint, root]);
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);
  const reload = useCallback(() => load(), [load]);
  return { ...state, reload };
}


