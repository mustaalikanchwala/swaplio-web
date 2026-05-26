'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Send, Loader2, Tag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useMessages, useConversations } from '@/hooks/useChat';
import { useListing } from '@/hooks/useListings';
import { useWebSocket } from '@/hooks/useWebSocket';
import { sendMessage } from '@/lib/websocket';
import { useAuth } from '@/hooks/useAuth';
import { getToken } from '@/lib/auth';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { useQueryClient } from '@tanstack/react-query';
import type { Message } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAi } from '@/hooks/useAi';

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

  const [replySuggestions, setReplySuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { getReplySuggestions, repliesLoading } = useAi();

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

  useEffect(() => {
    if (!localConversationId) return;
    queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }, [localConversationId, queryClient]);

  // ── Fetch reply suggestions when a new OTHER-party message arrives ──────────
  const handleNewMessage = useCallback(
    async (msg: Message) => {
      if (!currentUser || msg.senderId === currentUser.id) return;

      // Get last 4 messages from cache for context
      const cached = queryClient.getQueryData<Message[]>(['messages', localConversationId]) ?? [];
      const contextMsgs = cached.slice(-4).map((m) => `${m.senderName}: ${m.content}`);

      const role =
        currentUser.id === currentConversation?.buyerId ? 'buyer' : 'seller';

      const suggestions = await getReplySuggestions(contextMsgs, role);
      setReplySuggestions(suggestions);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser, localConversationId, currentConversation, queryClient]
  );

  // Subscribe to WebSocket
  useWebSocket({
    conversationId: localConversationId ?? undefined,
    onMessage: handleNewMessage,
    onReply: (msg: Message) => {
      if (!localConversationId && msg.conversationId) {
        setLocalConversationId(msg.conversationId);
        router.replace(`/chat/${msg.conversationId}`);
      }
    },
  });

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
    setReplySuggestions([]); // Clear suggestions on send

    const payload = localConversationId
      ? { conversationId: localConversationId, content: text }
      : { listingId: listingId ?? undefined, content: text };

    sendMessage('/app/chat.send', payload);
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Clear suggestions when user starts typing
    if (e.target.value && replySuggestions.length > 0) {
      setReplySuggestions([]);
    }
  };

  const handleChipClick = (suggestion: string) => {
    setInput(suggestion);
    setReplySuggestions([]);
    inputRef.current?.focus();
  };

  const showSuggestionsArea = repliesLoading || replySuggestions.length > 0;

  return (
    <div className="flex flex-col h-full bg-black/20 font-sans">
      {/* Header */}
      <div className="border-b border-bg-border px-4 py-3.5 flex items-center gap-3 bg-bg-surface shrink-0">
        <Link
          href="/chat"
          className="md:hidden p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="font-semibold text-sm text-white">
            {talkToName}
          </p>
          {listingId && !localConversationId && (
            <p className="text-[10px] text-text-muted mt-0.5 font-sans">
              Starting a new conversation
            </p>
          )}
          {currentConversation && (
            <p className="text-[10px] text-text-muted mt-0.5 font-sans truncate max-w-[250px] sm:max-w-md">
              Discussing: {currentConversation.listingTitle}
            </p>
          )}
        </div>
      </div>

      {/* Listing Mini-Card */}
      {listing && (
        <div className="bg-bg-elevated border-b border-bg-border px-4 py-2 flex items-center justify-between gap-3 animate-fade-in shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {listing.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.images[0].signedUrl}
                alt={listing.title}
                className="w-9 h-9 object-cover rounded-lg border border-white/5 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 bg-bg-surface rounded-lg flex items-center justify-center border border-bg-border shrink-0">
                <Tag size={14} className="text-text-muted shrink-0" />
              </div>
            )}
            <div className="min-w-0 font-sans">
              <p className="font-medium text-xs text-white truncate">
                {listing.title}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                ₹{listing.price} • {listing.condition.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <Link
            href={`/listings/${listing.id}`}
            className="text-[10px] text-accent hover:text-white font-semibold px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 hover:bg-accent/25 transition-all shrink-0"
          >
            View Info
          </Link>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-black/40">
        {isLoading ? (
          <div className="flex flex-col gap-4 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
                <div className="skeleton h-12 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
            <p className="text-sm text-text-muted">
              {localConversationId ? 'No messages yet.' : 'Say hello to start coordinating!'}
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
        <div ref={messagesEndRef} />
      </div>

      {/* AI Reply Suggestions */}
      <AnimatePresence>
        {showSuggestionsArea && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[10px] text-white/30 px-4 pt-2">✨ Quick replies</p>
            <div className="flex flex-wrap gap-2 px-4 py-2">
              {repliesLoading ? (
                // Skeleton chips
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-7 w-32 rounded-full bg-bg-elevated animate-pulse border border-bg-border"
                  />
                ))
              ) : (
                replySuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleChipClick(suggestion)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/70 hover:text-white border transition-all cursor-pointer ${i === 2 ? 'hidden sm:inline-flex' : ''}`}
                    style={{
                      background: '#111111',
                      borderColor: 'rgba(255,255,255,0.08)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(48,84,255,0.40)';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(48,84,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                      (e.currentTarget as HTMLElement).style.background = '#111111';
                    }}
                  >
                    <Sparkles size={10} className="text-accent/60 shrink-0" />
                    <span>{suggestion}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="border-t border-bg-border px-4 py-3 bg-bg-surface flex gap-3 items-end shrink-0">
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          className="input flex-1 resize-none max-h-32 overflow-y-auto rounded-xl py-2.5"
          id="chat-input"
          style={{ lineHeight: '1.5' }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:scale-100 shadow-glow-sm"
          id="chat-send"
          aria-label="Send message"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </motion.button>
      </div>
    </div>
  );
}
