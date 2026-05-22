'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Category } from '@/types';

// Categories never change in this app — fetch once and cache forever
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/api/categories').then((r) => r.data),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
