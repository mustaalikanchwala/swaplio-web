import { create } from 'zustand';
import { categoriesApi } from '@/api/categories';
import type { Category } from '@/types';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  fetched: boolean;
  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  fetched: false,

  fetchCategories: async () => {
    if (get().fetched) return; // cached
    set({ loading: true });
    try {
      const data = await categoriesApi.getAll();
      set({ categories: data, fetched: true });
    } catch {
      // silently fail — categories are non-critical
    } finally {
      set({ loading: false });
    }
  },
}));
