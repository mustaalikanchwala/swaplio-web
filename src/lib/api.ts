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

// ── AI Types ───────────────────────────────────────────────────────────────────

export interface PriceSuggestion {
  minPrice: number;
  maxPrice: number;
  reason: string;
}

export interface QualityCheck {
  score: number;
  tips: string[];
}

// ── AI API helper: creates a 15-second AbortController ────────────────────────
function aiSignal(): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}

// ── AI API Functions ──────────────────────────────────────────────────────────

export const suggestPrice = async (
  title: string,
  condition: string,
  category: string
): Promise<PriceSuggestion> => {
  const { signal, cleanup } = aiSignal();
  try {
    const res = await api.post('/api/ai/suggest-price', { title, condition, category }, { signal });
    return res.data;
  } finally {
    cleanup();
  }
};

export const generateDescription = async (
  title: string,
  condition: string,
  category: string
): Promise<string> => {
  const { signal, cleanup } = aiSignal();
  try {
    const res = await api.post('/api/ai/generate-description', { title, condition, category }, { signal });
    return res.data.description;
  } finally {
    cleanup();
  }
};

export const suggestReplies = async (
  recentMessages: string[],
  role: string
): Promise<string[]> => {
  const { signal, cleanup } = aiSignal();
  try {
    const res = await api.post('/api/ai/suggest-replies', { recentMessages, role }, { signal });
    return res.data.suggestions;
  } finally {
    cleanup();
  }
};

export const checkListingQuality = async (
  title: string,
  description: string
): Promise<QualityCheck> => {
  const { signal, cleanup } = aiSignal();
  try {
    const res = await api.post('/api/ai/check-quality', { title, description }, { signal });
    return res.data;
  } finally {
    cleanup();
  }
};
