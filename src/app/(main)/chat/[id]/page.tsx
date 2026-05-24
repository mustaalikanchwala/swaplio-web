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
import { useQueryClient } from '@tanstack/react-query';
import type { Message } from '@/types';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    if (!localConversationId) return;
    queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }, [localConversationId, queryClient]);

  // Subscribe to WebSocket
  useWebSocket({
    conversationId: localConversationId ?? undefined,
    onMessage: () => {},
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

      {/* Reply suggestions */}
      {!isLoading && (
        <div className="flex gap-2 px-4 py-2 bg-black/30 border-t border-bg-border/30 overflow-x-auto scrollbar-none shrink-0">
          {["Is this still available?", "Where can we meet?", "Would you take a lower price?"].map((chip) => (
            <button
              key={chip}
              onClick={() => setInput(chip)}
              className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold border border-bg-border bg-bg-elevated text-text-secondary hover:border-accent/40 hover:text-white transition-all whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-bg-border px-4 py-3 bg-bg-surface flex gap-3 items-end shrink-0">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
