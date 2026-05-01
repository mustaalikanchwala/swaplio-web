import api from './axiosInstance';
import type { Category } from '@/types';

export const categoriesApi = {
  getAll: () =>
    api.get<Category[]>('/api/categories').then((r) => r.data),
};
