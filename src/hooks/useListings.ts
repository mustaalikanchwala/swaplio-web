'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  CreateListingRequest,
  EditListingRequest,
  Listing,
  ListingFilterParams,
  Page,
} from '@/types';

// ── Browse listings (paginated + filters) ────────────────────────────────────
export function useListings(params: ListingFilterParams = {}) {
  return useQuery<Page<Listing>>({
    queryKey: ['listings', params],
    queryFn: () =>
      api
        .get<Page<Listing>>('/api/listings', { params: { size: 12, ...params } })
        .then((r) => r.data),
    staleTime: 30 * 1000,
  });
}

// ── Get single listing ────────────────────────────────────────────────────────
export function useListing(id: string) {
  return useQuery<Listing>({
    queryKey: ['listing', id],
    queryFn: () => api.get<Listing>(`/api/listings/${id}`).then((r) => r.data),
    staleTime: 60 * 1000,
    enabled: !!id,
  });
}

// ── My listings ───────────────────────────────────────────────────────────────
export function useMyListings(params: { page?: number; size?: number } = {}) {
  return useQuery<Page<Listing>>({
    queryKey: ['myListings', params],
    queryFn: () =>
      api
        .get<Page<Listing>>('/api/listings/my', { params: { size: 12, ...params } })
        .then((r) => r.data),
    staleTime: 30 * 1000,
  });
}

// ── Create listing (multipart) ────────────────────────────────────────────────
export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      images,
    }: {
      data: CreateListingRequest;
      images: File[];
    }) => {
      const form = new FormData();
      form.append(
        'listing',
        new Blob([JSON.stringify(data)], { type: 'application/json' })
      );
      images.forEach((img) => form.append('images', img));
      return api
        .post<Listing>('/api/listings', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

// ── Edit listing (multipart + keepImageIds) ───────────────────────────────────
export function useEditListing(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      newImages,
    }: {
      data: EditListingRequest;
      newImages: File[];
    }) => {
      const form = new FormData();
      form.append(
        'listing',
        new Blob([JSON.stringify(data)], { type: 'application/json' })
      );
      newImages.forEach((img) => form.append('images', img));
      return api
        .put<Listing>(`/api/listings/${id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

// ── Mark sold ─────────────────────────────────────────────────────────────────
export function useMarkSold(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.patch<Listing>(`/api/listings/${id}/sold`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

// ── Delete listing ────────────────────────────────────────────────────────────
export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/listings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}
