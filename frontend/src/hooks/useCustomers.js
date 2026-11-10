import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

export function useCustomers(search = '', refreshTrigger = 0) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoadedOnce = useRef(false);

  const fetchCustomers = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent || !hasLoadedOnce.current) {
        setLoading(true);
      }
      setError(null);
      try {
        const params = search ? { search } : {};
        const { data } = await api.get('/customers', { params });
        setCustomers(data);
        hasLoadedOnce.current = true;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers({ silent: false }), search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [fetchCustomers, search]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchCustomers({ silent: true });
    }
  }, [refreshTrigger, fetchCustomers]);

  return { customers, loading, error, refetch: () => fetchCustomers({ silent: false }) };
}
