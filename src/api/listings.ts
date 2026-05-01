import api from './axiosInstance';
import type {
  Listing,
  ListingPage,
  CreateListingRequest,
  EditListingRequest,
  SearchListingsParams,
} from '@/types';

export const listingsApi = {
  getAll: (page = 0, size = 10) =>
    api
      .get<ListingPage>('/api/listings', { params: { page, size } })
      .then((r) => r.data),

  getById: (id: string | number) =>
    api.get<Listing>(`/api/listings/${id}`).then((r) => r.data),

  getMyListings: () =>
    api.get<Listing[]>('/api/listings/my').then((r) => r.data),

  search: (params: SearchListingsParams) =>
    api.get<ListingPage>('/api/listings/search', { params }).then((r) => r.data),

  create: (data: CreateListingRequest, images: File[]) => {
    const form = new FormData();
    form.append(
      'listing',
      new Blob([JSON.stringify(data)], { type: 'application/json' })
    );
    images.forEach((img) => form.append('images', img));
    return api
      .post<Listing>('/api/listings', form)
      .then((r) => r.data);
  },

  update: (id: string | number, data: EditListingRequest, newImages: File[]) => {
    const form = new FormData();
    form.append(
      'listing',
      new Blob([JSON.stringify(data)], { type: 'application/json' })
    );
    newImages.forEach((img) => form.append('images', img));
    return api
      .put<Listing>(`/api/listings/${id}`, form)
      .then((r) => r.data);
  },

  markAsSold: (id: string | number) =>
    api.patch<Listing>(`/api/listings/${id}/sold`).then((r) => r.data),

  delete: (id: string | number) =>
    api.delete(`/api/listings/${id}`).then((r) => r.data),
};
