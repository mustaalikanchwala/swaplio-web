// ─────────────────────────────────────────────────────────────────────────────
// Axios instance with JWT request & 401 response interceptors
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';
import { clearAuth, getToken } from './auth';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://swaplio-backend.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 → clear auth state and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
