'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Listing, Page } from '@/types';

/**
 * Fetches a preview of listings for a given category.
 * Uses the paginated endpoint — we only consume page 0.
 * The response is a Spring Page<ListingResponse>, so we unwrap .content.
 */
export function useCategoryListings(categoryId: string, size = 8) {
  return useQuery<Listing[]>({
    queryKey: ['categoryListings', categoryId, size],
    queryFn: () =>
      api
        .get<Page<Listing>>('/api/listings/preview', {
          params: { categoryId, size, page: 0 },
        })
        .then((r) => r.data.content),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!categoryId,
  });
}
