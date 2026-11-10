import axios from 'axios';

const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const normalizedBaseUrl = envBaseUrl ? envBaseUrl.replace(/\/+$/, '').replace(/\/api$/i, '') : '';
const baseURL = normalizedBaseUrl ? `${normalizedBaseUrl}/api` : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
