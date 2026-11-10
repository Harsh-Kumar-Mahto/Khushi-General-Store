import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useCustomerDetail(customerId) {
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const [custRes, txRes] = await Promise.all([
        api.get(`/customers/${customerId}`),
        api.get(`/customers/${customerId}/transactions`),
      ]);
      setCustomer(custRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateCustomer = (updatedCustomer) => setCustomer(updatedCustomer);
  const addTransaction = (tx) => setTransactions((prev) => [...prev, tx]);

  return { customer, transactions, loading, error, refetch: fetchData, updateCustomer, addTransaction };
}
