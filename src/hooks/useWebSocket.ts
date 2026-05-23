'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectStomp, removeStompCallbacks, subscribeToTopic } from '@/lib/websocket';
import { getToken } from '@/lib/auth';
import type { Message } from '@/types';

interface UseWebSocketOptions {
  // Called when a new message arrives on the personal notification channel
  onNotification?: (message: Message) => void;
  // Conversation-specific topic subscription (chat page)
  conversationId?: string;
  onMessage?: (message: Message) => void;
  // Called when the sender receives their own message back with the new conversationId
  onReply?: (message: Message) => void;
}

/**
 * Global WebSocket hook. When called without conversationId, it sets up only
 * the personal notifications channel. When called with conversationId, it also
 * subscribes to that conversation's topic.
 *
 * Call this hook once in layout/Providers (global) and once in the chat page (scoped).
 *
 * Callbacks are stored in refs to avoid stale closure bugs — the latest version
 * of each callback is always invoked even when subscriptions were established
 * at an earlier render.
 */
export function useWebSocket({
  onNotification,
  conversationId,
  onMessage,
  onReply,
}: UseWebSocketOptions = {}) {
  const queryClient = useQueryClient();

  // ── Refs hold the latest callback references ──────────────────────────────
  // This prevents stale closures: subscriptions are set up once but always call
  // the most up-to-date handler function.
  const onNotificationRef = useRef(onNotification);
  const onMessageRef = useRef(onMessage);
  const onReplyRef = useRef(onReply);

  useEffect(() => { onNotificationRef.current = onNotification; }, [onNotification]);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onReplyRef.current = onReply; }, [onReply]);

  useEffect(() => {
    const token = getToken();
    if (!token) return; // not logged in — do not connect

    // Track subscriptions for cleanup
    let notifSub: ReturnType<typeof subscribeToTopic> = null;
    let convSub: ReturnType<typeof subscribeToTopic> = null;
    let replySub: ReturnType<typeof subscribeToTopic> = null;

    const callbacks = {
      onConnected: () => {
        // ── 1. Personal notification channel (always subscribe) ──────────────
        notifSub = subscribeToTopic(
          '/user/queue/notifications',
          (frame) => {
            try {
              const msg: Message = JSON.parse(frame.body);
              // Invalidate chat badge and conversation list
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
              queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
              onNotificationRef.current?.(msg);
            } catch {
              // ignore malformed frames
            }
          }
        );

        // ── 2. Conversation-scoped topic (chat page only) ─────────────────────
        if (conversationId) {
          convSub = subscribeToTopic(
            `/topic/conversation/${conversationId}`,
            (frame) => {
              try {
                const msg: Message = JSON.parse(frame.body);
                // Append to cached messages list
                queryClient.setQueryData<Message[]>(
                  ['messages', conversationId],
                  (old) => (old ? [...old, msg] : [msg])
                );
                // A message arrived — badge may need updating for both parties
                // (sender: no change; receiver: +1 from backend, but then immediately
                //  zeroed because the chat is open and backend marks it read on next fetch)
                queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                onMessageRef.current?.(msg);
              } catch {
                // ignore
              }
            }
          );
        }

        // ── 3. Reply channel — for sender's conversationId discovery ──────────
        // Subscribed when there is no conversationId yet (new conversation flow).
        // The backend sends the MessageResponse (with the new conversationId) to
        // /user/{senderEmail}/queue/reply immediately after saving the first message.
        // Once received, we update the query cache and call onReply so the page
        // can redirect to /chat/{conversationId}.
        if (!conversationId) {
          replySub = subscribeToTopic(
            '/user/queue/reply',
            (frame) => {
              try {
                const msg: Message = JSON.parse(frame.body);
                // Prime the message cache with this first message
                if (msg.conversationId) {
                  queryClient.setQueryData<Message[]>(
                    ['messages', msg.conversationId],
                    (old) => (old ? [...old, msg] : [msg])
                  );
                  // Invalidate conversation list so it appears in the sidebar
                  queryClient.invalidateQueries({ queryKey: ['conversations'] });
                }
                onReplyRef.current?.(msg);
                // Unsubscribe immediately — only needed for first-message discovery
                replySub?.unsubscribe();
                replySub = null;
              } catch {
                // ignore
              }
            }
          );
        }
      },
    };

    connectStomp(callbacks);

    return () => {
      notifSub?.unsubscribe();
      convSub?.unsubscribe();
      replySub?.unsubscribe();
      removeStompCallbacks(callbacks);
      // Only fully disconnect when the global hook unmounts (layout teardown)
      // Individual chat page hooks just unregister their callbacks and topics.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);
}
