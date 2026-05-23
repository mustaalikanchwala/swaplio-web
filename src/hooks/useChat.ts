'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Conversation, Message } from '@/types';

// ── All conversations for the current user ─────────────────────────────────
export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: () =>
      api.get<Conversation[]>('/api/chat/conversations').then((r) => r.data),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // poll as fallback for notification badge
  });
}

// ── Messages for a specific conversation ──────────────────────────────────
export function useMessages(conversationId: string) {
  return useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: () =>
      api
        .get<Message[]>(`/api/chat/conversations/${conversationId}/messages`)
        .then((r) => r.data),
    enabled: !!conversationId,
    staleTime: Infinity, // live messages come via WebSocket
  });
}

// ── Total unread count (for nav badge) ────────────────────────────────────
export function useUnreadCount() {
  return useQuery<number>({
    queryKey: ['unreadCount'],
    queryFn: () =>
      api.get<number>('/api/chat/unread-count').then((r) => r.data),
    staleTime: 0,
    refetchInterval: 30 * 1000, // poll every 30 s as a reliable fallback
  });
}

// ── Helper to manually invalidate conversations (called from WS handler) ──
export function useInvalidateConversations() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
  };
}
