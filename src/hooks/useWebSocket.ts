'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectStomp, disconnectStomp, subscribeToTopic } from '@/lib/websocket';
import { getToken } from '@/lib/auth';
import type { Message } from '@/types';

interface UseWebSocketOptions {
  // Called when a new message arrives on the personal notification channel
  onNotification?: (message: Message) => void;
  // Conversation-specific topic subscription (chat page)
  conversationId?: string;
  onMessage?: (message: Message) => void;
}

/**
 * Global WebSocket hook. When called without conversationId, it sets up only
 * the personal notifications channel. When called with conversationId, it also
 * subscribes to that conversation's topic.
 *
 * Call this hook once in layout.tsx (global) and once in the chat page (scoped).
 */
export function useWebSocket({
  onNotification,
  conversationId,
  onMessage,
}: UseWebSocketOptions = {}) {
  const queryClient = useQueryClient();
  const notifSubRef = useRef<ReturnType<typeof subscribeToTopic>>(null);
  const convSubRef = useRef<ReturnType<typeof subscribeToTopic>>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return; // not logged in — do not connect

    const client = connectStomp({
      onConnected: () => {
        // ── 1. Personal notification channel (always subscribe) ──────────────
        notifSubRef.current = subscribeToTopic(
          '/user/queue/notifications',
          (frame) => {
            try {
              const msg: Message = JSON.parse(frame.body);
              // Invalidate chat badge and conversation list
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
              queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
              onNotification?.(msg);
            } catch {
              // ignore malformed frames
            }
          }
        );

        // ── 2. Conversation-scoped topic (chat page only) ─────────────────────
        if (conversationId) {
          convSubRef.current = subscribeToTopic(
            `/topic/conversation/${conversationId}`,
            (frame) => {
              try {
                const msg: Message = JSON.parse(frame.body);
                // Append to cached messages list
                queryClient.setQueryData<Message[]>(
                  ['messages', conversationId],
                  (old) => (old ? [...old, msg] : [msg])
                );
                onMessage?.(msg);
              } catch {
                // ignore
              }
            }
          );
        }
      },
    });

    return () => {
      notifSubRef.current?.unsubscribe();
      convSubRef.current?.unsubscribe();
      // Only fully disconnect when the global hook unmounts (layout teardown)
      if (!conversationId) {
        disconnectStomp();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

}
