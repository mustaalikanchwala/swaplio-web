'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Loader2, Tag } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useMessages, useConversations } from '@/hooks/useChat';
import { useListing } from '@/hooks/useListings';
import { useWebSocket } from '@/hooks/useWebSocket';
import { sendMessage } from '@/lib/websocket';
import { useAuth } from '@/hooks/useAuth';
import { getToken } from '@/lib/auth';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useQueryClient } from '@tanstack/react-query';
import type { Message } from '@/types';

export default function ChatRoomPage() {
  const { id: conversationId } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');

  const { user: currentUser } = useAuth();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [localConversationId, setLocalConversationId] = useState<string | null>(
    conversationId !== 'new' ? conversationId : null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation details and listing info
  const { data: conversations = [] } = useConversations();
  const currentConversation = conversations.find((c) => c.id === localConversationId);
  const finalListingId = listingId || currentConversation?.listingId;
  const { data: listing } = useListing(finalListingId ?? '');

  const talkToName = currentConversation
    ? currentUser?.id === currentConversation.buyerId
      ? currentConversation.sellerName
      : currentConversation.buyerName
    : listing
    ? listing.sellerName
    : 'New Message';

  const queryClient = useQueryClient();

  // Load message history (disabled for new conversations)
  const { data: messages = [], isLoading } = useMessages(localConversationId ?? '');

  // When a conversation is opened, the REST call to load messages marks them as read
  // on the backend. Invalidate badge + conversation list immediately so the UI reflects
  // the updated unread count without waiting for the 30s poll.
  useEffect(() => {
    if (!localConversationId) return;
    queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }, [localConversationId, queryClient]);

  // Subscribe to conversation topic via WebSocket
  // On first-message: subscribe to /user/queue/reply to discover new conversationId
  useWebSocket({
    conversationId: localConversationId ?? undefined,
    onMessage: () => {
      // Auto-scroll handled by the useEffect below
    },
    onReply: (msg: Message) => {
      // First-message case: backend sends MessageResponse with new conversationId
      // via /user/queue/reply specifically for the sender's discovery.
      if (!localConversationId && msg.conversationId) {
        setLocalConversationId(msg.conversationId);
        // Update URL without reloading
        router.replace(`/chat/${msg.conversationId}`);
      }
    },
  });

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: messages.length > 10 ? 'smooth' : 'auto' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const token = getToken();
    if (!token) {
      toast.error('You must be logged in.');
      return;
    }

    setSending(true);
    setInput('');

    // Build payload — first message uses listingId, subsequent use conversationId
    const payload = localConversationId
      ? { conversationId: localConversationId, content: text }
      : { listingId: listingId ?? undefined, content: text };

    sendMessage('/app/chat.send', payload);
    // Do NOT add message to UI here — wait for it to arrive via WebSocket (no optimistic rendering)

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="glass border-b border-[var(--border-subtle)] px-4 py-3 flex items-center gap-3" style={{ borderRadius: 0 }}>
          <Link
            href="/chat"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="font-semibold text-sm text-[var(--text-primary)]">
              {talkToName}
            </p>
            {listingId && !localConversationId && (
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                Starting a new conversation
              </p>
            )}
            {currentConversation && (
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                Discussing: {currentConversation.listingTitle}
              </p>
            )}
          </div>
        </div>

        {/* Listing Mini-Card */}
        {listing && (
          <div className="bg-white/5 border-b border-[var(--border-subtle)] px-4 py-2 flex items-center justify-between gap-3 animate-fade-in shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {listing.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.images[0].signedUrl}
                  alt={listing.title}
                  className="w-9 h-9 object-cover rounded-lg border border-white/10 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 shrink-0">
                  <Tag size={14} className="text-[var(--text-muted)] shrink-0" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-xs text-[var(--text-primary)] truncate">
                  {listing.title}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  ₹{listing.price} • {listing.condition}
                </p>
              </div>
            </div>
            <Link
              href={`/listings/${listing.id}`}
              className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold px-2 py-1 rounded bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-all shrink-0"
            >
              View Info
            </Link>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-violet-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-[var(--text-muted)]">
                {localConversationId ? 'No messages yet.' : 'Say hello!'}
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={msg.senderId === currentUser?.id}
              />
            ))
          )}
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="glass border-t border-[var(--border-subtle)] px-4 py-3 flex gap-3 items-end" style={{ borderRadius: 0 }}>
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            className="input flex-1 resize-none max-h-32 overflow-y-auto"
            id="chat-input"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="btn-primary px-4 py-2.5 shrink-0 disabled:opacity-40"
            id="chat-send"
            aria-label="Send message"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}

