// ─────────────────────────────────────────────────────────────────────────────
// Axios instance — centralized API client with JWT injection + 401 handling
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';
import { getToken, clearAuth } from './auth';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://swaplio-backend.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT from cookie on every request ──────────────
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: on 401 wipe auth and redirect to login ──────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearAuth();
      // Hard redirect so React state is fully reset
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
