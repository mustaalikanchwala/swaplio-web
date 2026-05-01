import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = 'https://swaplio-backend.onrender.com';
// const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('swaplio_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? error.message ?? 'Something went wrong';

    if (status === 401) {
      localStorage.removeItem('swaplio_token');
      localStorage.removeItem('swaplio_user');
      // Redirect to login without React Router (imperative)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.', { className: 'toast-custom' });
    } else if (status !== 404) {
      // 404 handled per-page; show toast for other errors
      if (message && status !== 422) {
        toast.error(message, { className: 'toast-custom' });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
