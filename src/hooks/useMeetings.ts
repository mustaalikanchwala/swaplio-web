'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  BuyerRespondPayload,
  Meeting,
  RequestMeetingPayload,
  SellerRespondPayload,
} from '@/types';

// Helper — ensures HH:mm → HH:mm:ss
export function formatTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

// Helper — ensures Date → yyyy-MM-dd
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0];
}

// ── Buyer's meetings (meetings I requested) ───────────────────────────────────
export function useBuyerMeetings(filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery<Meeting[]>({
    queryKey: ['meetings', 'buyer', filters],
    queryFn: () =>
      api
        .get<Meeting[]>('/api/meetings/buyer', { params: filters })
        .then((r) => r.data),
    staleTime: 30 * 1000,
  });
}

// ── Seller's meetings (meetings on my listings) ───────────────────────────────
export function useSellerMeetings(filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery<Meeting[]>({
    queryKey: ['meetings', 'seller', filters],
    queryFn: () =>
      api
        .get<Meeting[]>('/api/meetings/seller', { params: filters })
        .then((r) => r.data),
    staleTime: 30 * 1000,
  });
}

// ── Single meeting ─────────────────────────────────────────────────────────────
export function useMeeting(id: string) {
  return useQuery<Meeting>({
    queryKey: ['meeting', id],
    queryFn: () => api.get<Meeting>(`/api/meetings/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

// ── Request a meeting (buyer) ──────────────────────────────────────────────────
export function useRequestMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RequestMeetingPayload) => {
      const normalised: RequestMeetingPayload = {
        ...payload,
        meetingDate: formatDate(payload.meetingDate),
        meetingTime: formatTime(payload.meetingTime),
      };
      return api.post<Meeting>('/api/meetings', normalised).then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', 'buyer'] });
    },
  });
}

// ── Seller responds (confirm / reject / reschedule) ────────────────────────────
export function useSellerRespond(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SellerRespondPayload) => {
      const normalised: SellerRespondPayload = {
        ...payload,
        proposedDate: payload.proposedDate
          ? formatDate(payload.proposedDate)
          : undefined,
        proposedTime: payload.proposedTime
          ? formatTime(payload.proposedTime)
          : undefined,
      };
      return api
        .patch<Meeting>(`/api/meetings/${meetingId}/seller-respond`, normalised)
        .then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['meetings', 'seller'] });
    },
  });
}

// ── Buyer responds (accept / decline reschedule) ───────────────────────────────
export function useBuyerRespond(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BuyerRespondPayload) =>
      api
        .patch<Meeting>(`/api/meetings/${meetingId}/buyer-respond`, payload)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['meetings', 'buyer'] });
    },
  });
}

// ── Cancel meeting ─────────────────────────────────────────────────────────────
export function useCancelMeeting(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api
        .patch<Meeting>(`/api/meetings/${meetingId}/cancel`)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}
